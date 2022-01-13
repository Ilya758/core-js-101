/* eslint-disable max-len */
/* eslint-disable operator-linebreak */
/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  count: 0,
  tmpCounter: 1,
  isCombined: false,
  's-1': '',
  selectorIsExisted: false,
  restraints: {
    elemIsExisted: false,
    idIsExisted: false,
    pseudoIsExisted: false,
  },

  checkSelectorExistence(cond) {
    if (!this.selectorIsExisted || (cond && this.selectorIsExisted)) {
      this.count += 1;
      this.selectorIsExisted = true;
    }
  },

  checkPossibleMatchesOfSelectors(cond) {
    if (cond && this[`s-${this.count}`]) {
      throw Error(
        // eslint-disable-next-line comma-dangle
        'Element, id and pseudo-element should not occur more then one time inside the selector'
      );
    }
  },

  reducer(sel, value, isElement = false) {
    if (sel === '') {
      this.checkSelectorExistence(this.restraints.elemIsExisted);
      this.checkPossibleMatchesOfSelectors(this.restraints.elemIsExisted);
      this.restraints.elemIsExisted = true;
    } else if (sel === '#') {
      this.checkSelectorExistence(this.restraints.idIsExisted);
      this.checkPossibleMatchesOfSelectors(this.restraints.idIsExisted);
      this.restraints.idIsExisted = true;
    } else if (sel === '::') {
      this.checkSelectorExistence(this.restraints.pseudoIsExisted);
      this.checkPossibleMatchesOfSelectors(this.restraints.pseudoIsExisted);
      this.restraints.pseudoIsExisted = true;
    } else {
      this.checkSelectorExistence(null);
    }

    if (isElement) {
      this[`s-${this.count}`] = `${value}`;
    } else if (sel === '[]') {
      this[`s-${this.count}`] += `[${value}]`;
    } else {
      this[`s-${this.count}`] += `${sel}${value}`;
    }
    return this;
  },

  element(value) {
    return this.reducer('', value, true);
  },

  id(value) {
    return this.reducer('#', value);
  },

  class(value) {
    return this.reducer('.', value);
  },

  attr(value) {
    return this.reducer('[]', value);
  },

  pseudoClass(value) {
    return this.reducer(':', value);
  },

  pseudoElement(value) {
    return this.reducer('::', value);
  },

  combine(selector1, combinator, selector2) {
    if (!this.isCombined) {
      this.isCombined = true;
      this.tmpCounter = this.count;
    }

    const second = selector2[`s-${selector2.tmpCounter}`];

    this.tmpCounter -= 1;
    const first = selector1[`s-${selector1.tmpCounter}`];

    this[`s-${this.tmpCounter}`] = `${first} ${combinator} ${second}`;

    return this;
  },

  reset() {
    for (; this.count >= 1; this.count -= 1) {
      delete this[`s-${this.count}`];
    }

    this.restraints.elemIsExisted = false;
    this.restraints.idIsExisted = false;
    this.restraints.pseudoIsExisted = false;
    this.selectorIsExisted = false;
    this['s-1'] = '';
    this.count = 0;
    this.tmpCounter = 1;
    this.isCombined = false;
  },

  stringify() {
    const fullSelector = this['s-1'];
    this.reset();
    return fullSelector;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
