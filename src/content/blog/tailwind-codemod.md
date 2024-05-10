---
title: "Tailwind Codemod"
description: "Foo Bar Baz"
pubDate: "May 26 2024"
---

While working on a converting `create-react-app` codebase to one that uses
Next.js, I found myself with an interesting problem: all of the Material Design
based class names that were created using TailwindCSS had to be changed. The
"primary" color was `#f43f5e`. In the new code base, `#f43f53` was mapped to
`red-500`. That meant that `text-primary-main` class was being replaced with
`text-red-500`. With the Material Design class names being deprecated, a class
like `text-primary-main` needed to be updated to its color specific class name,
`text-red-500`.

The "legacy" `tailwind.config.js` file had its colors set up like this:

```
module.exports = {
  theme: {
    colors: {
      black: "#333",
      primary: {
        "light": "#fecdd3",
        "main": "#f43f5e",
        "dark": "#881337"
      },
      secondary: {
        "light": "#dbeafe",
        "main": "#3b82f6",
        "dark": "#1e3a8a"
      },
      // info
      // success
      // etc.
    },
  },
  ...
}
```

That newer config file, `tailwind.config.mjs`, is set up like this:

```
export default {
  theme: {
    colors: {
      black: "#333",
      red: {
        "50": "#fff1f2",
        "100": "#ffe4e6",
        "200": "#fecdd3", // primary.light
        "300": "#fda4af",
        "400": "#fb7185",
        "500": "#f43f5e", // primary.main
        "600": "#e11d48",
        "700": "#be123c",
        "800": "#9f1239",
        "900": "#881337"  // primary.dark
      },
      blue: {
        "50": "#eff6ff",
        "100": "#dbeafe", // secondary.light
        "200": "#bfdbfe",
        "300": "#93c5fd",
        "400": "#60a5fa",
        "500": "#3b82f6", // secondary.main
        "600": "#2563eb",
        "700": "#1d4ed8",
        "800": "#1e40af",
        "900": "#1e3a8a"  // secondary.dark
      },
      // info
      // success
      // etc.
    }
  }
}
```

The colors from the Material Design inspired legacy config file are still being
used. They have been replaced with a palette that captures all of the hues for
the base colors that previously made up the Material Design colors. This opens
up the possiblity for using more colors without having to add a primary
"lighter" option when a lighter red color than what `.text-primary-light` would
provide is needed.

This newly, expanded color palette presents a challenge: how do we update the
classes of 1000+ React components to use the new Tailwind class names? How do we
update `text-primary-main` and `bg-primary-main` to `text-red-500` and
`bg-red-500`?

Using Node.js, I will show you how to write a script that generates values from
the two config files, outputting a JSON file that maps the old colors to the new
ones.

```
{
  // old color       : new color
  'text-primary-main': 'text-red-500'
}
```

Using that JSON, I can write a codemod that converts a class like
`text-primary-main` to `text-red-500` for all React components.

Parsing tailwind.config.mjs

How do we get the values from the Tailwind config files with Node.js?
JSCodeShift.

JSCodeShift is a library for writing "codemods". _Definition of codemod_. For
this first step, I won't be using JSCodeShift to write a code mode. I will use
JSCodeshift to parse the two config files, creating the JSON file that will be
used to in the codemod.

The script I will show was written to be ran with Node version 20. I was working
with two different code bases in 2 separate folders, so I put this script into a
folder that was a sibling to those folders. We will call this new folder
`tailwind-codemod`, and run `npm init -y` to initialize it. Using `zsh`, I ran
the following:

```
mkdir tailwind-codemod && cd $_
npm init -y
```

We need to install JSCodeshift.

```
npm i jscodeshift
```

Using Node version 20, I can use ECMAScript Modules, so I created `index.mjs`. I
wanted to pass the two config files as CLI args to the script, like so:

```
node index.mjs --legacy path/to/tailwind.legacy.js --updated path/to/tailwind.new.mjs
```

Yes

While I have imported those files directly, writing Node CLI scripts is a fun
hobby. By adding the `--legacy` and `--updated` CLI args, I get to lean into
this a little bit.

The entire contents of `tailwind-codemod/index.mjs` are below, and have been
commented to explain each step.

```
import fs from "node:fs/promises";
import path from "node:path";
import * as url from "node:url";
import j from "jscodeshift";
import nopt from "nopt";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const { legacy, updated } = nopt(
  {
    legacy: path,
    updated: path,
  },
  {},
  process.argv,
  2,
);

/**
 * Convert both tailwind config files into abstract syntax trees.
 */
const legacyAst = j(await fs.readFile(legacy, "utf8"));
const newAst = j(await fs.readFile(updated, "utf8"));

/**
 * Recursively parses the key / value pairs on an object node path, updating
 * the `colors` argument with the same shape as the node path's AST.
 */
function parseAstObjectProperties(colors, nodePath) {
  if (nodePath.value.type === "Literal") {
    /**
     * The legacy config is using strings for keys and the new config has both
     * strings and numbers for keys. When a key is a string, we can get the key
     * using `nodePath.key.name`. A number is a literal, and the parsed key node
     * path does not have a `nodePath.key.name`; it has `nodePath.key.value`.
     */
    colors[nodePath.key.name || nodePath.key.value] = nodePath.value.value;
  } else if (nodePath.value.type === "ObjectExpression") {
    colors[nodePath.key.name || nodePath.key.value] = {};

    for (const propertyPath of nodePath.value.properties) {
      parseAstObjectProperties(colors[nodePath.key.name], propertyPath);
    }
  }
}

/**
 * Looks for the `colors` key on the config's ast, and then grabs the key
 * values from it, adding them to the provided `colors` argument.
 */
function getColorsFromAst(ast, colors) {
  // biome-ignore lint/complexity/noForEach: ignore ast.forEach
  ast
    .find(j.Property, {
      key: {
        name: "colors",
      },
    })
    .forEach((path) => {
      for (const propertyPath of path.value.value.properties) {
        parseAstObjectProperties(colors, propertyPath);
      }
    });
}

const legacyColors = {};
const newColors = {};

getColorsFromAst(legacyAst, legacyColors);
getColorsFromAst(newAst, newColors);

/**
 * Utilty function for parsing the tailwind config values into object key /
 * value pairs, [['key', 'value']], in a recursive manner. The path of nested
 * objects are used to create the key.
 *
 * This:
 *
 *  black: '#333',
 *  primary: {
 *    main: '#f43f5e',
 *  }
 *
 *  becomes this:
 *
 *  [
 *    ['black', '#333'],
 *    ['primary-main', '#f43f5e'],
 *  ]
 */
function getColorKeyValuePairs(input, classNamePrefix = "", output = []) {
  if (typeof input === "object") {
    for (const [key, value] of Object.entries(input)) {
      getColorKeyValuePairs(
        value,
        classNamePrefix === "" ? key : `${classNamePrefix}-${key}`,
        output,
      );
    }
  } else {
    output.push([classNamePrefix, input]);
  }

  return output;
}

const legacyKeyValuePairs = getColorKeyValuePairs(legacyColors);
const newColorKeyValuePairs = getColorKeyValuePairs(newColors);

/**
 * This is an array of tuples that have both the old and new values.
 * [[ 'primary-main', 'red-500']]
 */
const newClassNamePairs = [];

/**
 * Populate `newClassNamePairs` with the values from `legacyKeyValuePairs` and
 * `newColorKeyValuePairs`.
 */
for (const [legacyPath, legacyValue] of legacyKeyValuePairs) {
  for (const [newPath, newValue] of newColorKeyValuePairs) {
    if (legacyValue.toLowerCase() === newValue.toLowerCase()) {
      newClassNamePairs.push([legacyPath, newPath]);
    }
  }
}

/**
 * Create a JSON file that maps legacy color values to their new values. This
 * JSON file is only used to spot check our work.
 */
await fs.writeFile(
  path.join(__dirname, "tw-colors-map.json"),
  JSON.stringify(Object.fromEntries(newClassNamePairs.sort()), null, 2),
  "utf8",
);

/**
 * This will hold the class names tailwind automatically creates for us using
 * the colors we provide it. So the `primary` color becomes `text-primary-main`,
 * `bg-primary-main`, `border-primary-main`. We want to map the legacy colors to
 * what they're new class names will be, with the legacy class name as the key,
 * and the updated class name as the value.
 *
 * { "text-primary-main": "text-red-100" }
 */
let newColorClassNames = {};
const twClassNamePrefixes = ["text", "bg", "border"];

/**
 * Loop over the Tailwind class name prefixes, building an object with our
 * legacy class names mapped to their new classname.
 */
for (const classNamePrefix of twClassNamePrefixes) {
  newColorClassNames = {
    ...newColorClassNames,
    ...newClassNamePairs.reduce((memo, item) => {
      memo[`${classNamePrefix}-${item[0]}`] = `${classNamePrefix}-${item[1]}`;
      return memo;
    }, {}),
  };
}

/**
 * Create a JSON file with the old Tailwind class names mapped to their new
 * class names. We will use this JSON file when doing the transform that will
 * update our React components, replacing the old legacy names with the new
 * ones.
 */
await fs.writeFile(
  path.join(__dirname, "tw-classes-map.json"),
  JSON.stringify(newColorClassNames, null, 2),
  "utf8",
);
```

A brief synopsis:

- get the config files from the script arguments
- use JSCodeshift to get the contents of `theme.colors`
- create a "look up" object that allows me to map the old generated Tailwind
  class names with the new class names
- create a JSON file

I actually created two JSON files. There is `tw-classes-map.json`, which will be
used to update the old class names to their newer counterparts. There is also
`tw-colors-map.json`. This was used to help me spot check that my work of
mapping the legacy class names to their new class names was correct.

- talk about `legacy` folder
- write a script to analyze our usage of `className` in new code base.
- write a codemod that addresses all instances of updating class name
