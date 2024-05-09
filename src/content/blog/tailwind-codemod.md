---
title: "Tailwind Codemod"
description: "Foo Bar Baz"
pubDate: "May 26 2024"
---

While working on a converting `create-react-app` codebase to one that uses Next.js,
I found myself with a very niche problem: all of the Material Design based class
names that were created using TailwindCSS had to be changed. The "primary" color
was `#f43f5e`. In the new code base, `#f43f53` was mapped to `red-500`. That
meant that `text-primary-main` class was being replaced with `text-red-500`.
With the Material Design class names being deprecated, a class like
`text-primary-main` needed to be updated to its color specific class name,
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

You will notice that the legacy config file was a CommonJS file. The new config
file was an ECMAScript module. That newer config file, `tailwind.config.mjs`
(note the `.mjs` filee extension) is set up like this:

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

The colors from the Material Design inspired legacy config file are still being used.
They have been replaced with a palette that captures all of the hues for the base colors that previously made
up the Material Design colors. This opens up
the possiblity for using more colors without having to add a primary "lighter"
option when a lighter red color than `.primary-light` is needed.

This newly, expanded color palette presents a challenge: how do we update the
classes of 1000+ React components to use the new Tailwind class names? How do we
update `text-primary-main` and `bg-primary-main` to `text-red-500` and
`bg-red-500`? With JavaScript.

Using Node.js, I will show you how to write a script that generates
values from the two `tailwind.config.mjs` files, outputting a JSON
file that we can use

```
{
  // old color       : new color
  'text-primary-main': 'text-red-500'
}
```

Using that JSON, I will write a codemod that converts the `text-primary-main`
class to `text-red-500` for all React components in a folder. For fun, we'll
convert those Node.js scripts into two handy little CLI tools that we can pipe
from one into another.

To convert one class to another, we need a way to map the legacy class name with
its newer version. We can use an object with the following shape to help with
that conversion:

```
{
  'text-primary-main': 'text-red-500'
}
```

When it is time to update the React components, we can use this object to
determine what the new value of `text-primary-main` should be. We'll use both
`tailwind.config.mjs` files to create this "look up" object.

Parsing tailwind.config.mjs

For practical reasons, we will pretend that both `tailwind.config.mjs` files are
the same in terms of their structure. Their respective color values are the main
difference between the two.

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
      // secondary
      // info
      // success
      // etc.
    },
  },
  ...
}
```

How do we get the values from the `tailwind.config.mjs` files with Node.js? JSCodeShift.

JSCodeShift is a library for writing "codemods". _Definition of codemod_. We do not
want to modify any code with JSCodeShift. That comes later. We only want to get the
abstract syntax tree from the `tailwind.config.mjs` files, and JSCodeShift is a good
enough tool for doing that. Later we will do more exciting things with JSCodeShift, such
as parsing and updating React components.

Let's create a script called `getTailwindConfigColorValues.mjs`. This script will be
ran from the command line and will accept two arguments, `--old` and `--new`.

```

```

We will use LIBRARY to parse the two command line arguments. If any of the two
arguments are missing, we will exit the program.

At this point, we are only logging the values of the two arguments. Next will
set up JSCodeShift to parse the `tailwind.config.mjs` files, logging their contents.

code snippet

Babel's parser is being used to power JSCodeShift. There are other parsers that we can take advantage of. Babel's parser is one that I am familiar with so let's use that.

With JSCodeShift, we can get the color values from the `tailwind.config.js` files.

code snippet

We have the nodes that we care about. That isn't quite what we need. Take a look for yourself using AST Explorer. AST Explorer is a great tool to use for exploring abstract syntax trees. Click or highlight any of the code you see in the top left corner and you will see the abstract syntax tree that was interpreted by the Babel parser in the top right corner. This is a great way to get comfortable with working with ASTs. The bottom left panel can be used to write a codemod, with the output of that codemod being shown in the bottom right panel. Those two panels are not relevant to us.

Using the ASTs from both `tailwind.config.js` files, we can create the look up object that we will be using for our codemod. The ASTs for both color objects.

Outputting JSON

Returning the JSON is easy enough. Maybe we want the option to create a JSON file? Let's add a command line argument for that. We'll go with `--out=<file name>`. This will allow us to run `node ./convertTailwindColors.mjs --old=path/to/old/tailwind.config.js --new=path/to/new/tailwind.config.js --out=colors.json` and get a JSON files that looks like this:

```
{ }
```

CLI

Running this script as-is is fine. But what if we made it a proper command line tool? Than we would do the following:

```
convert-tw-colors --old=path/to/old/tailwind.config.js --new=path/to/new/tailwind.config.js
```

By making it a proper command line tool, we are not dependent upon where the script itself resides.

Create a new directory and start a new npm package with the necessary dependencies installed:

```
Mkdir convert-tw-colors
cd convert-tw-colors
npm init -y
npm i <dependencies>
```

We are going to set up our package's API first. This will allow for us to use as a module inside of another module.

```
import convertTWColors from 'convert-tw-colors';

// do something with convertTWColors
```

This is a very niche tool so the odds of actually having to do this are close to nil. But it is a good exercise nonetheless.

```
<set up api folders>
<move existing script into package>
```

With that done we can convert our package into a proper CLI tool.

```
<set up CLI folders>
<prefer global>
```

We now have a CLI tool written with Node.js that allows us to provide a JSON object
that provides a look up of the color values from two `tailwind.config.js` files.
In my next post, I'll walk through using the JSON to modify all of React
components in a folder using JSCodeShift.
