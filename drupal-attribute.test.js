const { describe, expect, test } = require("@jest/globals");

const { DrupalAttribute } = require("./drupal-attribute.js");

describe("DrupalAttribute", () => {
  test.each([
    [
      {
        // The special `$drupal` attribute should be ignored.
        $drupal: true,
        "data-selector": "",
        "aria-controls": "test",
        id: "test",
        "single-space": " ",
        "boolean-true": true,
        "boolean-false": false,
      },
      ' data-selector="" aria-controls="test" id="test" single-space=" " boolean-true="true" boolean-false="false"'
    ],
    [
      {
        class: ["one", "two", "three"],
      },
      ` class="one two three"`,
    ],
  ])("toString", (attributes, htmlAttributeString) => {
    const drupalAttribute = new DrupalAttribute(Object.entries(attributes))
    expect(drupalAttribute.toString()).toEqual(htmlAttributeString);
  });
});
