---
title: "Tailwind Codemod"
description: "Foo Bar Baz"
pubDate: "May 26 2024"
---

During a recent project of migrating a `create-react-app` codebase to Next.js, I
faced an interesting challenge: updating Tailwind class names across 1000+ React
components. Specifically, the Material Design-based class names needed to be
replaced with new color-specific class names. For example, the
`text-primary-main` class (mapped to `#f43f5e`) had to be changed to
`text-red-500`.

The legacy `tailwind.config.js` was configured with the Material Design colors
like so:

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

The new configuration in `tailwind.config.mjs` provided a more comprehensive
palette:

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

With the expanded palette, it was essential to ensure accurate and efficient
class name updates.

Using Node.js, I'll demonstrate how to create a script that extracts values from
the two configuration files and generates a JSON file mapping old colors to new
ones. This JSON file will look like this:

```
{
  // old class name  : new class name
  'text-primary-main': 'text-red-500'
}
```

Using this JSON file, you can write a codemod to update all instances of the
Material Design-inspired class names in your React components to those that
follow the Tailwind color naming convention.

Parsing tailwind.config.mjs

How can we extract the values from the Tailwind config files using Node.js? The
answer is JSCodeShift.

JSCodeShift is a library designed for writing "codemods". A codemod is an
automated script used to refactor or modify code at scale, often across large
codebases. It is commonly employed to update syntax, migrate libraries, or
implement consistent coding standards efficiently. In this initial step, instead
of using JSCodeShift to write a codemod, I will use it to parse the two config
files and create the JSON file needed for the codemod that will update the React
components.

The script I'll demonstrate is designed to run with Node version 20. Managing
two separate codebases in different directories, I placed this script in a new
folder adjacent to those directories, named `tailwind-codemod`, and initialized
it using `npm init -y`. Using `zsh`, I executed the following commands:

```
mkdir tailwind-codemod && cd $_
npm init -y
```

Next, I installed JSCodeshift:

```
npm i jscodeshift@^0.15.2 nopt
```

I used `jscodeshift@^0.15.2` when I originally wrote this script. When I tried
using the latest version for this post, I ran into some issues. So `0.15.2` it
is.

To pass the two config files as command-line arguments to the script, I used:

```
node index.mjs --legacy path/to/tailwind.legacy.js --updated path/to/tailwind.new.mjs
```

MAYBE DELETE THIS PARAGRAPH BELOW?

While I directly imported these files, crafting Node CLI scripts is a hobby I
enjoy. Incorporating the `--legacy` and `--updated` CLI arguments adds an extra
layer of functionality to this process.

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
- create a "look up" object that allows me to map the old class names with the
  new ones
- create two JSON files, `tw-classes-map.json` and `tw-colors-map.json`

`tw-classes-map.json` will be used in the codemod that updates the old class
names to their newer counterparts. The `tw-colors-map.json` is used to help spot
check that the work of mapping the class names.

As mentioned earlier, this work was part of a re-platforming project for an
existing web application. With a new repository at hand and numerous old files
needing updates, manually verifying and updating each class name was overly
cumbersome. However, directly migrating the old codebase into the `src`
directory of the new codebase or applying the codemod to the active legacy
codebase wasn't feasible.

To solve this, we established a dedicated `legacy` folder within the new
repository. This allowed us to selectively transfer significant portions of the
legacy codebase and execute our codemod. Throughout the migration of features,
the codemod significantly streamlined our tasks, eliminating one less concern
from our checklist.

If our classes were written like this, writing our codemod would be pretty
straightforward.

```
className="flex w-full flex-col items-end rounded-lg border border-primary-main"
```

It is more reasonable to assume they look this:

```
className={cx(
  className,
  'flex w-full flex-col rounded-lg border border-primary-main'
)}
```

And this:

```
className={active ? 'active' : ''}
```

There are a lot of expressions used to style our React components. We can use
JSCodeShift to help us analyze our React components, generating a JSON and text
file to see all of the different iterations. These files will help us to write
our codemod that will update them.

The entire contents of `tailwind-codemod/analysis.mjs` are below, and have been
commented to explain each step.

```
import fs from 'node:fs/promises';
import path from 'node:path';
import * as url from 'node:url';
import parser from '@babel/parser';
import j from 'jscodeshift';
import nopt from "nopt";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const { legacy } = nopt(
  {
    legacy: path,
  },
  {},
  process.argv,
  2,
);

const classNameAnalysis = {};
let text = '';

/**
 * Recursively analyze the `className`s props for all of files that end with
 * ".jsx" or ".tsx" in a directory. We want to see what kind of AST node types
 * make up our `className` props. `className="action"` is a `StringLiteral` and
 * `className={active ? 'active' : ''}` is a `ConditionalExpression`. Using
 * JSCodeShift, we want to see what AST node types are used to create our
 * `className` props. This will update the `classNameAnalysis` object to the following
 * format:
 *
 * {
 *   "ConditionalExpression": [ // AST node type
 *     "className={active ? 'active' : ''}
 *   ],
 *   "LogicalExpression": [
 *     "className={foo === 'foobar' && 'foo bar'}
 *   ]
 * }
 */
async function analyzeClassNames(sourcePath) {
  const stats = await fs.stat(sourcePath);
  const isSourcePathDir = stats.isDirectory();
  const files = isSourcePathDir ? await fs.readdir(sourcePath) : [sourcePath];

  for await (const fileName of files) {
    const filePath = isSourcePathDir
      ? path.join(sourcePath, fileName)
      : fileName;
    const stats = await fs.stat(filePath);

    const isDir = stats.isDirectory();

    if (isDir) {
      await analyzeClassNames(filePath);
    } else if (fileName.match(/(jsx|tsx)$/)) {
      const source = await fs.readFile(filePath, 'utf8');

      /**
       * Use JSCodeShift to parse the file for the React component. Since we
       * are parsing files that can have either JSX or TypeScript, we need to
       * use the `@babel/parser` to help with parsing them.
       */
      const root = j(source, {
        parser: {
          parse: (code, options) =>
            parser.parse(code, {
              ...options,
              tokens: true,
              plugins: ['jsx', 'typescript'],
            }),
        },
      });

      /**
       * Using `j.JSXAttribute`, we can target the `className` prop on all React
       * components.
       */
      root
        .find(j.JSXAttribute, {
          name: {
            name: 'className',
          },
        })
        .forEach((path) => {
          const { type } = path.value.value;

          /**
           * `StringLiteral` is for `className="foo"`. We know those exist so we'll skip
           * them in our analysis.
           */
          if (type === 'StringLiteral') {
            return;
          }

          if (!classNameAnalysis[type]) {
            classNameAnalysis[type] = [];
          }

          /**
           * A `JSXExpressionContainer` is used to embed expressions within JSX
           * elements, like `className={isFoo ? 'foo' : 'bar baz'}`. This is
           * what we want to analyze.
           */
          if (type === 'JSXExpressionContainer') {
            if (Array.isArray(classNameAnalysis[type])) {
              classNameAnalysis[type] = {};
            }

            const expressionType = path.node.value.expression.type;

            if (!classNameAnalysis[type][expressionType]) {
              classNameAnalysis[type][expressionType] = [];
            }

            const source = j(path.node).toSource();

            if (
              !classNameAnalysis[type][expressionType].find((item) => item === source)
            ) {
              classNameAnalysis[type][expressionType].push(source);
            }
          }
        });
    }
  }
}

await analyzeClassNames(legacy);

/**
 * It can be helpful to see what the `className` prop looks like in the file
 * itself. We can use the contents of our `classNameAnalysis` analysis object to
 * create a `.txt` file that is more human-readable, like this:
 *
 * className={cx(
 *   className,
 *   'flex w-full flex-col rounded-lg border border-primary-main'
 * )}
 *
 * className={active ? 'active' : ''}
 *
 */
for (const className of classNameAnalysis) {
  const data = classNameAnalysis[className];

  if (Array.isArray(data)) {
    for (const item of data) {
      text += `\n\n${item}`;
    }
  } else {
    for (const key of data) {
      for (const item of data[key]) {
        text += `\n\n${item}`;
      }
    }
  }
}

await fs.writeFile(
  path.join(__dirname, 'classNames-analysis.json'),
  JSON.stringify(classNameAnalysis, null, ' '),
  'utf8',
);

await fs.writeFile(
  path.join(__dirname, 'classNames-analysis.txt'),
  text,
  'utf8',
);
```

This script utilizes JSCodeShift more than the previous script. It is grabbing
the `className` prop JSCodeShift's `JSXAttribute`, using the node path that
represents the AST for `className`. Using the `type` of the node path, it can be
determined what the node type for the `className` is, output in a JSON and
`.txt` format to look at.

Running this script against the `/legacy` folder I saw the different expressions
used for the `className` prop:

```
CallExpression
ConditionalExpression
Identifier
LogicalExpression
MemberExpression
OptionalMemberExpression
TemplateLiteral
```

With this list, we know which type of expressions to target with our next
codemod.

- write a codemod that addresses all instances of updating class name
