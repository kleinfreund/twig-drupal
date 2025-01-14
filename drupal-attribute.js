/**
 * @param {Array<[string, string[] | string | boolean]>} args
 */
function DrupalAttribute(args) {
  /**
   * @type {Array<[string, string[] | string | boolean]>}
   */
  this.args = args;

  this.args.forEach((arg) => {
    if (arg[0] !== "$drupal") {
      this[arg[0]] = arg[1];
    }
  });

  /**
   * @returns {DrupalAttribute}
   */
  this.addClass = function () {
    let self = this;
    let values = [];

    for (let i = 0; i < arguments.length; i++) {
      values.push(arguments[i]);
    }

    values.forEach(function (value) {
      if (!Array.isArray(value)) {
        value = [value];
      }

      if (!self.class) {
        self.class = [];
      }

      let classes = self.class;

      value.forEach(function (d) {
        if (classes.indexOf(d) < 0) {
          classes.push(d);
        }
      });
    });

    return this;
  };

  this.removeClass = function (value) {
    let classes = [];

    if (this.class) {
      classes = this.class;
    }

    if (!Array.isArray(value)) {
      value = [value];
    }

    value.forEach(function (v) {
      let index = classes.indexOf(v);

      if (index > -1) {
        classes.splice(index, 1);
      }
    });

    return this;
  };

  this.hasClass = function (value) {
    let classes = [];

    if (this.class) {
      classes = this.class;
    }

    return classes.indexOf(value) > -1;
  };

  this.setAttribute = function (key, value) {
    this.set(key, value);

    return this;
  };

  this.removeAttribute = function (key) {
    this.delete(key);

    return this;
  };
}
DrupalAttribute.prototype.toString = function () {
  let result = "";
  let components = [];

  this.args.forEach(([attribute, value]) => {
    // Ignore the special `$drupal` attribute.
    if (attribute === "$drupal") {
      return;
    }

    // Normalize array-of-strings and boolean values to strings.
    const normalizedValue = Array.isArray(value)
      ? value.join(" ")
      : typeof value === "boolean" ? String(value) : value;

    components.push(attribute + '="' + normalizedValue + '"');
  });

  let rendered = components.join(" ");

  if (rendered) {
    result += " " + rendered;
  }

  return result;
};

module.exports = {
  DrupalAttribute,
}
