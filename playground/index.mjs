import fs from "fs/promises";
import path from "path";
import * as url from "url";
import legacyConfig from "./tailwind.config.legacy.js";
import newConfig from "./tailwind.config.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

/**
 * Utilty function for parsing the tailwind config values into object key /
 * value pairs, [['key', 'value']], in a recursive manner.
 */
function getColorKeyValuePairs(input, classNamePrefix = "", output = []) {
  if (typeof input === "object") {
    Object.entries(input).forEach(([key, value]) => {
      getColorKeyValuePairs(
        value,
        classNamePrefix === "" ? key : `${classNamePrefix}-${key}`,
        output
      );
    });
  } else {
    output.push([classNamePrefix, input]);
  }

  return output;
}

const newColorKeyValuePairs = getColorKeyValuePairs(newConfig.theme.colors);
const legacyKeyValuePairs = getColorKeyValuePairs(legacyConfig.theme.colors);

/**
 * This is an array of tuples that have both the old and new values.
 * [[ 'primary-main', 'red-500']]
 */
const newClassNamePairs = [];

legacyKeyValuePairs.forEach(([legacyPath, legacyValue]) => {
  newColorKeyValuePairs.forEach(([newPath, newValue]) => {
    if (legacyValue.toLowerCase() === newValue.toLowerCase()) {
      newClassNamePairs.push([legacyPath, newPath]);
    }
  });
});

/**
 * Create a JSON file that maps legacy color values to their new values. This
 * JSON file is only used to spot check our work.
 */
await fs.writeFile(
  path.join(__dirname, "tw-colors-map.json"),
  JSON.stringify(Object.fromEntries(newClassNamePairs.sort()), null, 2),
  "utf8"
);

/**
 * This will hold the class names tailwind automatically creates for us.
 * `text-primary-main`, `bg-primary-main`, `border-primary-main`. We want to
 * map the legacy colors to what they're new class names will be, giving us an
 * object that will look like this:
 *
 * { "text-primary-main": "text-red-100" }
 */
let newColorClassNames = {};
const twClassNamePrefixes = ["text", "bg", "border"];

/**
 * Loop over the Tailwind class name prefixes, building an object with our
 * legacy class names mapped to their new classname.
 */
twClassNamePrefixes.forEach((classNamePrefix) => {
  newColorClassNames = {
    ...newColorClassNames,
    ...newClassNamePairs.reduce((memo, item) => {
      memo[`${classNamePrefix}-${item[0]}`] = `${classNamePrefix}-${item[1]}`;
      return memo;
    }, {}),
  };
});

/**
 * Create a JSON file with the old Tailwind class names mapped to their new
 * class names. We will use this JSON file when doing our transform.
 */
await fs.writeFile(
  path.join(__dirname, "tw-classes-map.json"),
  JSON.stringify(newColorClassNames, null, 2),
  "utf8"
);
