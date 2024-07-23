---
title: "Tailwind Codemod"
description: "Foo Bar Baz"
pubDate: "July 26 2024"
---

During a recent project of migrating a `create-react-app` code base to Next.js,
I faced an interesting challenge: updating Tailwind class names across 1000+
React components.

The legacy code base used a [Material Design](https://m2.material.io/design/color/the-color-system.html)-based convention for naming classes.
This resulted in class names like `bg-primary-light` and `bg-primary-main`.
These class names had to be updated to a new color-specific class naming convention like `bg-blue-200` and `bg-blue-500`. Changing these by hand would be time consuming and 
tedious.

This post outlines the steps I took to update Tailwind class names across 1000+
React components using Node.js and jscodeshift. I will outline the various steps
I took for both analyzing and updating the code base. 

These examples will be using the latest version of Node.js, version 22.

## Something Here

Before diving in, it is important to evaluate if a codemod is the right tool.
Using codemods to make large scale changes across your code base can be game
changing for your producivity. It can also sink that productivity as well. When
starting a project like this, you need to ask some very important questions:

1. How many files need to be updated?
2. Is it worth putting in the time it takes to learn a new tool to make these
   changes? Or will it be quicker to make the changes manually, even making the
   changes manually is more tedious?
3. How easily is it for you to test that the codemod made the updates as you
   intended? How easy is it to undo the changes?

This list is by no means an exhaustive one but it highlights that challenges,
and potential dangers, that come up when using a powerful tool like a codemod.

For my specific use case, this was a complete rewrite of an existing application
that was months away from having any external users. The design of the
application was going to stay the way but the Tailwind classes that powered that
design was going to change. I had success in the past with making large scale
changes in the legacy code base, so I had already tackled the learning curve
that went into writing codemods. While it took a few days to accomplish, it was
worth it. By the end of this post, I hope you feel empowered to make a similar
choice when the opportunity presents itself to you.

## Analyzing the Tailwind Config Files

Like most React applications that use Tailwind, we had a `tailwind.config.js`
CommonJS file that was configured with a Material Design-based convention for
class naming:

```js
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
      // info, success, etc
    },
  },
  ...
}
```

While sufficient for most use cases, there were limitations that this naming
convention introduced. Need a color lighter than `primary-light`? Hello,
`primary-lighter`. The new application had a `tailwind.config.mjs` ESM file that 
provided a more comprehensive palette that you would typically see in a code
base that uses Tailwind:

```js
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
      // info, success, etc,
    }
  }
}
```

We needed a way to map the class names that would be generated from the legacy
config with those from the new config. Using Node, we can examine both config
files, creating a JSON file that be can used in the codemod to update the old
class names.

```json
{
  // old class name  : new class name
  'text-primary-main': 'text-red-500'
}
```

## Parsing the Tailwind Config Files

How can we extract the values from the Tailwind config files using Node.js? [With
jscodeshift](https://github.com/facebook/jscodeshift).

jscodeshift is a library designed for writing "codemods". A codemod is an
automated script used to refactor or modify code at scale, often across large
code bases. It is commonly employed to update syntax, migrate libraries, or
implement consistent coding standards efficiently. In this initial step, instead
of using jscodeshift to write a codemod, I will use it to parse the two config
files and create the JSON file needed for the codemod that will update the React
components.

With two separate code bases in different directories, I placed this script in a
new folder adjacent to them, named `tailwind-codemod`. Next, I created a new npm 
package, installed jscodeshift, and created a `analyzeConfigs.mjs` file for my script:

```
mkdir tailwind-codemod
cd tailwind-codemod
npm init -y
npm i jscodeshift@^0.15.2
touch analyzeConfigs.mjs
```

I used `jscodeshift@^0.15.2` when I originally wrote this script. When I tried
using the latest version for this post, I ran into some issues. I do not recall
what those issues were so `0.15.2` it is.

My intent is to write a script that I can pass the paths of both code bases
as arguments. This script then outputs a JSON file into my `tailwind-codemod`
directory.

```
node analyzeConfigs.mjs --legacy path/to/tailwind.config.js --updated path/to/tailwind.config.mjs
```

The contents of `tailwind-codemod/analyzeConfigs.mjs` are below, and have been commented
to explain each step.

```js
import fs from "node:fs/promises";
import path from "node:path";
import * as url from "node:url";
import { parseArgs } from "node:util";
import j from "jscodeshift";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const {
  values: { legacy, updated },
} = parseArgs({
  options: {
    legacy: {
      type: "string",
    },
    updated: {
      type: "string",
    },
  },
});

/**
 * These objects will be used to look up the colors from each
 * config. As we parse the configs, we will add the key value
 * pairs used to create the Tailwind class names to each object.
 */
const legacyColors = {};
const newColors = {};

/**
 * Convert both tailwind config files into abstract syntax trees.
 */
const legacyAst = j(await fs.readFile(legacy, "utf8"));
const newAst = j(await fs.readFile(updated, "utf8"));

/**
 * Recursively parses the key / value pairs on an object node
 * path, updating the `colors` argument with the same structure as 
 * the Tailwind config.
 */
function parseAstObjectProperties(colors, nodePath) {
  if (nodePath.value.type === "Literal") {
    /**
     * The legacy config is using strings for keys and the new 
     * config has both strings and numbers for keys. When a key 
     * is a string, we can get the key using `nodePath.key.name`. 
     * A number is a literal, and the parsed key node path does 
     * not have a `nodePath.key.name`; it has `nodePath.key.value`.
     */
    colors[nodePath.key.name || nodePath.key.value] = nodePath.value.value;
  } else if (nodePath.value.type === "ObjectExpression") {
    /**
     * We have a key with a value that is an an object (such 
     * as `theme.colors.primary`) so let's create a new key on 
     * `colors` using the key. This allows us to capture the 
     * nested values, such as `light`, `main`, `dark`, etc.
     */
    colors[nodePath.key.name || nodePath.key.value] = {};

    for (const propertyPath of nodePath.value.properties) {
      parseAstObjectProperties(colors[nodePath.key.name], propertyPath);
    }
  }
}

/**
 * Looks for the "colors" key on the config's ast, and then 
 * grabs the key values from it, adding them to the provided 
 * `colors` argument.
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

getColorsFromAst(legacyAst, legacyColors);
getColorsFromAst(newAst, newColors);

/**
 * Utilty function for parsing the tailwind config values 
 * into object key / value pairs, [['key', 'value']], in a 
 * recursive manner. The path of nested objects are used to 
 * create the key.
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
 * Populate `newClassNamePairs` with the values from `legacyKeyValuePairs` 
 * and `newColorKeyValuePairs`.
 */
for (const [legacyPath, legacyValue] of legacyKeyValuePairs) {
  for (const [newPath, newValue] of newColorKeyValuePairs) {
    if (legacyValue.toLowerCase() === newValue.toLowerCase()) {
      newClassNamePairs.push([legacyPath, newPath]);
    }
  }
}

/**
 * Create a JSON file that maps legacy color values to their 
 * new values. This JSON file is only used to spot check our work.
 */
await fs.writeFile(
  path.join(__dirname, "tw-colors-map.json"),
  JSON.stringify(Object.fromEntries(newClassNamePairs.sort()), null, 2),
  "utf8",
);

/**
 * This will hold the class names tailwind automatically creates 
 * for us using the colors we provide it. So the `primary` color 
 * becomes `text-primary-main`, `bg-primary-main`, `border-primary-main`. 
 * We want to map the legacy colors to what their new class names 
 * will be, with the legacy class name as the key, and the updated 
 * class name as the value.
 *
 * { "text-primary-main": "text-red-100" }
 */
let newColorClassNames = {};
const twClassNamePrefixes = ["text", "bg", "border"];

/**
 * Loop over the Tailwind class name prefixes, building an object 
 * with our legacy class names mapped to their new classname.
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
 * Create a JSON file with the old Tailwind class names mapped 
 * to their new class names. We will use this JSON file when doing 
 * the transform that will update our React components, replacing 
 * the old legacy names with the new ones.
 */
await fs.writeFile(
  path.join(__dirname, "tw-classes-map.json"),
  JSON.stringify(newColorClassNames, null, 2),
  "utf8",
);
```

A brief synopsis:

- get the config files from the script arguments
- create a "look up" object that allows you to map the old class names with the
  new ones
- use jscodeshift to get the contents of `theme.colors` from those config files
- take the values from the "look up" objects and map them to two JSON files,
  `tw-classes-map.json` and `tw-colors-map.json`

`tw-classes-map.json` is used in the codemod that updates the old class names to
their newer counterparts. The `tw-colors-map.json` is used to help spot check
that the work of mapping the class names. `tw-colors-map.json` allowed for me to
spot check that `primary-main` was correctly mapped to `red-500`. This helped me
to check my work. `tw-classes-map.json` has the actual classes that we want to
migrate in the code base:

```js
{
  "text-black": "text-black",
  "text-primary-dark": "text-red-900",
  "text-primary-light": "text-red-200",
  "text-primary-main": "text-red-500"
}
```

It helps with mapping `primary-main` into the `bg-primary-main`,
`text-primary-main` and `border-primary-main` Tailwind classes that are
generated from the config file.

As mentioned earlier, this work was part of a re-platforming project for an
existing web application. With a new repository at hand and numerous old files
needing updates, manually verifying and updating each class name was overly
cumbersome. However, directly migrating the old code base into the `src`
directory of the new code base or applying the codemod to the active legacy code
base wasn't feasible. base wasn't feasible.

To solve this, we established a dedicated `legacy` folder within the new
repository. This allowed us to selectively transfer significant portions of the
legacy code base and execute our codemod. Throughout the migration of features,
the codemod significantly streamlined our tasks, eliminating one less concern
from our checklist.

If our classes were written like this, writing our codemod would be pretty
straightforward:

```js
className="flex w-full flex-col items-end rounded-lg border border-primary-main"
```

It is more reasonable to assume they look this:

```js
className={cx(
  className,
  'flex w-full flex-col rounded-lg border border-primary-main'
)}
```

And this:

```js
className={active ? 'active' : ''}
```

There are a lot of expressions used to style our React components. We can use
jscodeshift to help us analyze our React components, generating a JSON and text
file to see all of the different iterations. These files will help us to write
our codemod that will update them.

With this approach, we can create `tailwind-codemod/analyzeClassNames.mjs`. Here are the
contents of `tailwind-codemod/analyzeClassNames.mjs` commented to explain each step:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import * as url from 'node:url';
import { parseArgs } from "node:util";
import parser from '@babel/parser';
import j from 'jscodeshift';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const {
  values: { legacy },
} = parseArgs({
  options: {
    legacy: {
      type: "string",
    },
  },
});

const classNameAnalysis = {};
let text = '';

/**
 * Recursively analyze the `className`s props for all of 
 * files that end with ".jsx" or ".tsx" in a directory. 
 * We want to see what kind of AST node types make up our
 * `className` props. `className="action"` is a `StringLiteral`
 * and `className={active ? 'active' : ''}` is a `ConditionalExpression`. 
 * Using jscodeshift, we want to see what AST node types are 
 * used to create our `className` props. This will update the 
 * `classNameAnalysis` object to the following format:
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
       * Use jscodeshift to parse the file for the React 
       * component. Since we are parsing files that can 
       * have either JSX or TypeScript, we need to use the 
       * `@babel/parser` to help with parsing them.
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
       * Using `j.JSXAttribute`, we can target the `className` 
       * prop on all React components.
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
           * `StringLiteral` is for `className="foo"`.  * We 
           * know those exist so we'll skip * them in our analysis.
           */
          if (type === 'StringLiteral') {
            return;
          }

          if (!classNameAnalysis[type]) {
            classNameAnalysis[type] = [];
          }

          /**
           * A `JSXExpressionContainer` is used to embed expressions 
           * within JSX elements, like `className={isFoo ? 'foo' : 'bar baz'}`. 
           * This is what we want to analyze.
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

This script utilizes jscodeshift more than the previous script. It is grabbing
the `className` prop with jscodeshift's `JSXAttribute`, using the node path that
represents the AST for `className`. Using the `type` of the node path, it can be
determined what the node type for the `className` is, output in a JSON and
`.txt` format to look at.

Running this script against the `/legacy` folder I saw the different expressions
used for the `className` prop:

```
CallExpression
ConditionalExpression
LogicalExpression
TemplateLiteral
```

This is a truncated list. A mature code base will probably have much more. For
this post, this list will be suffice.

With this list, we can write a codemod that addresses these use cases. In the
`tailwind-codemod` folder, we can create `transform.mjs` with the following
content:

```js
import classLookUp from "./tw-classes-map.json";

/**
 * Create a regular expression from all of the keys on the
 * look up object created to map the legacy classes with the
 * newer class names. Probably a more efficient way of doing
 * this. :)
 */
const classNamesRE = new RegExp(
  `\\b(?:${Object.keys(classLookUp).join("|")})\\b`,
  "g",
);

/**
 * Take a `value` from AST node path and check it for a legacy
 * class name. If there is a match, use the class look up to
 * swap the legacy class name with the updated class name.
 */
function matchClassName(value) {
  if (!value) {
    return false;
  }

  try {
    const matches = [];
    let newValue = value;

    // Use the regular expression to find matches
    let match;

    while ((match = classNamesRE.exec(value)) !== null) {
      matches.push(match[0]);
    }

    if (matches.length) {
      for (const match of matches) {
        newValue = value.replace(match, classLookUp[match]);
      }

      return newValue;
    }
  } catch (e) {
    console.log("error", e);
  }
}

/* Allow for parsing Typescript files. */
export const parser = "tsx";

/* This is where the transform starts. */
export default (file, api) => {
  /**
   * Alias the jscodeshift API
   */
  const j = api.jscodeshift;

  /**
   * Parse the code into an AST
   */
  const root = j(file.source);

  /**
   * Find all JSX attributes that are `className` and then iterate
   * over them.
   */
  root
    .find(j.JSXAttribute, {
      name: {
        name: "className",
      },
    })
    .forEach((path) => {
      const { value } = path.value;

      /* className="text-primary-main bg-primary-light" */
      if (value.type === "StringLiteral") {
        const newValue = matchClassName(value.value);

        if (newValue) {
          value.value = newValue;
        }
      }

      /* className={ ... } */
      if (value.type === "JSXExpressionContainer") {
        switch (value.expression.type) {
          /* className={fn( ... )} */
          case "CallExpression":
            for (const arg of value.expression.arguments) {
              if (arg.type === "StringLiteral") {
                const newValue = matchClassName(arg.value);

                if (newValue) {
                  arg.value = newValue;
                }
              }

              /* className={cx("text-primary-main", {"bg-primary-dark": isActive})} */
              if (arg.type === "ObjectExpression") {
                for (const property of arg.properties) {
                  const newValue = matchClassName(property?.key?.value);

                  if (newValue) {
                    property.key.value = newValue;
                  }
                }
              }
            }
            break;

          /* className={isActive && "text-primary-dark"} */
          case "LogicalExpression":
            for (const side of [
              value.expression.left,
              value.expression.right,
            ]) {
              if (side.type === "StringLiteral") {
                const newValue = matchClassName(side.value);

                if (newValue) {
                  side.value = newValue;
                }
              }
            }
            break;

          /*  className={isActive ? "text-primary-light" : "text-primary-main"} */
          case "ConditionalExpression":
            if (value.expression.consequent.type === "StringLiteral") {
              const newValue = matchClassName(
                value.expression.consequent.value,
              );

              if (newValue) {
                value.expression.consequent.value = newValue;
              }
            }

            if (value.expression.alternate.type === "StringLiteral") {
              const newValue = matchClassName(value.expression.alternate.value);

              if (newValue) {
                value.expression.alternate.value = newValue;
              }
            }

            break;

          /* className={`${className} text-primary-dark`} */
          case "TemplateLiteral":
            for (const quasisValue of value.expression.quasis) {
              const newValue = matchClassName(quasisValue.value.raw);

              if (newValue) {
                quasisValue.value.raw = newValue;
              }
            }
            break;
        }
      }
    });

  /**
   * Use jscodeshift to update the contents of the file.
   */
  return root.toSource();
};
```

A brief synopsis of this is file is:

- import our JSON look up and turn it into a regular expression
- find all `className` attributes in a file's JSX
- update `className` attributes that match the type of `CallExpression`, `ConditionalExpression`, `LogicalExpression` or `TemplateLiteral` with the updated class name

We run our transform in "dry" mode (which will not make any changes) with the 
following command:

```
npx jscodeshift@0.15.2 -t path/to/transform.mjs path/to/dir -d
```

That will show the following output in your terminal:

```
Processing 1 files...
Spawning 1 workers...
Running in dry mode, no files will be written!
Sending 1 files to free worker...
All done.
Results:
0 errors
1 unmodified
0 skipped
0 ok
Time elapsed: 0.282seconds
```

When you are ready to run the transform, experiment with only running it against
a single file or directory. Run `git diff` on the updated file to see the output, 
spot checking what the transform does. You will find use cases that you did not
consider. The transform code above does not cover all of the edge cases for the
4 types that are being targeted. 

In the tech sector's current climate, engineers are being asked to do more with
less. Codemods are great tools to help with that. While it will take some time to
master them, you are picking up a new skill that will make you a force multiplier.
The next time you have to make an update that spans many files, look into
writing a codemod for making that change.
