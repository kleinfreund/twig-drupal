const twig = require("twig");
const twigDrupal = require("twig-drupal-filters");
const twigDrupalWithout = require("twig-drupal-filters/filters/without");

const { DrupalAttribute } = require("./drupal-attribute.js");

module.exports = {
  engine: twig.twig,

  extendEngine({ engine, init }, cache = false) {
    const engineInstance = engine || twig;

    engineInstance.cache(cache);

    twigDrupal(engineInstance);

    engineInstance.extendFilter("without", function (value, args) {
      if (!value) return {};

      if (typeof value === "string") {
        let str = value;

        args.forEach((a) => {
          const pattern = `/\\s${a}="[^"]*"/`;
          str = value.replace(new RegExp(pattern), "");
        });

        return str;
      }

      if (value.args && value.args.find((arg) => arg[0] === "$drupal")) {
        const values = { ...value };
        values.args = values.args.filter((arg) => {
          return !args.includes(arg[0]);
        });

        return DrupalAttribute.prototype.toString.call(values);
      }

      return twigDrupalWithout(value, args);
    });

    engineInstance.extend(function (Twig) {
      Twig.exports.extendTag({
        type: "trans",
        regex: /^trans$/,
        next: ["endtrans", "plural", "variable"],
        open: true,
        compile: function (token) {
          return token;
        },
        parse: function (token, context, chain) {
          var html = "";

          token.output.forEach((output) => {
            if (output.type === "raw") {
              html += output.value;
            } else {
              if (output.type === "output") {
                html += Twig.expression.parse.apply(this, [
                  output.stack,
                  context,
                ]);
              }
            }
          });

          return {
            chain: chain,
            output: html,
          };
        },
      });

      Twig.exports.extendTag({
        type: "endtrans",
        regex: /^endtrans$/,
        next: [],
        open: false,
      });

      Twig.exports.extendTag({
        type: "plural",
        regex: /^plural\s+(.+)$/,
        next: ["endtrans"],
        open: false,
      });
    });

    if (init && typeof init === "function") {
      init(engineInstance);
    }

    return engineInstance.twig;
  },

  async extendTemplateData(file, engineOptions = {}, data = {}) {
    if (
      typeof data === "string" ||
      typeof data === "number" ||
      typeof data === "boolean"
    ) {
      return data;
    }

    if (Array.isArray(data)) {
      data.forEach(async (entry, i) => {
        data[i] = await this.extendTemplateData(file, engineOptions, entry);
      });

      return data;
    }

    const o = {};
    Object.entries(data).forEach(async ([attr, entries]) => {
      if (!(entries === null || entries === undefined)) {
        if (entries["$drupal"]) {
          o[attr] = new DrupalAttribute(Object.entries(entries));
        } else if (
          typeof entries === "string" ||
          typeof entries === "number" ||
          typeof entries === "boolean"
        ) {
          o[attr] = entries;
        } else {
          o[attr] = await this.extendTemplateData(file, engineOptions, entries);
        }
      }
    });

    return o;
  },
};
