"use strict";

// No published ESLint plugin enforces "no numeric spacing literals in RN
// style objects" the way eslint-plugin-react-native's no-color-literals does
// for colors, so this is a small local rule instead of a dependency.
const SPACING_PROPS = new Set([
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "paddingHorizontal",
  "paddingVertical",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "marginHorizontal",
  "marginVertical",
  "gap",
  "rowGap",
  "columnGap",
]);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow numeric literals for spacing style properties; use spacing tokens instead.",
    },
    schema: [],
    messages: {
      noSpacingLiteral:
        "Use a spacing token (e.g. `spacing.md`) instead of the numeric literal {{value}} for '{{prop}}'.",
    },
  },
  create(context) {
    return {
      Property(node) {
        const key = node.key;
        const propName =
          key.type === "Identifier" ? key.name : key.type === "Literal" ? String(key.value) : null;
        if (!propName || !SPACING_PROPS.has(propName)) return;

        const value = node.value;
        if (value.type === "Literal" && typeof value.value === "number") {
          context.report({
            node: value,
            messageId: "noSpacingLiteral",
            data: { value: String(value.value), prop: propName },
          });
        }
      },
    };
  },
};
