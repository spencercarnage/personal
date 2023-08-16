---
title: 'Yarn Modern with Plug''n''Play and "Zero-Installs"'
description: 'A primer on how to add Yarn Modern with Plug''n''Play and "Zero-Installs" to a JavaScript project'
pubDate: "May 26 2023"
---

Ever since Facebook released Yarn in 2016, it has become an
essential tool for developers. According to Stack Overflow's 2022
survey of 70,000 developers, 27% of those respondents use Yarn.
Introducing a lock file and parallel downloads, Yarn pushed the
envelope of what a JavaScript dependency management tool can do.
The release of version 2 (known as Yarn Modern or Yarn Berry)
introduced [Plug'n'Play](https://yarnpkg.com/features/pnp) with
[Zero-Installs](https://yarnpkg.com/features/zero-installs). In
this article I will walk you through creating a project using the
Yarn Modern, adding Plug'n'Play and Zero-Installs as we go.

## What is Plug'n'Play and Zero-Installs?

Plug'n'Play is a strategy for installing a project's dependencies.
Zero-Installs is a collection of Yarn's features used to make your
project as fast and stable as possible.

Have you ran into a problem with a project's dependencies that was
only solved with `rm -rf node_modules`? Or running a node script
on your machine works but that same script fails to run on a
coworker's? The Yarn docs calls this the ["node_modules
problem"](https://yarnpkg.com/features/pnp/#the-node_modules-problem).

The "node_modules problem" refers to the inefficiencies caused by
using the [Node Resolution
Algorithm](https://nodejs.org/api/modules.html#all-together) to
look up a project's dependencies. The Node Resolution Algorithm
looks for files that are `require`'d or `import`'d, recursively
(and indiscriminately) searching all the way to the home directory
of the computer it is being run on. With the volume of files
installed, and different `stat` and `readdir` calls, this
traditional approach is costly in space and time. Every minute
spent on CI / CD installing node modules and bootstrapping your
application is money coming out of someone's pocket.

Plug'n'Play and Zero-Installs provide a solution: replace large
`node_modules` downloads with zipped cached files that unzip at
runtime.

## Setting up a new project with Yarn Modern

First, we need to upgrade to the latest version of Yarn.

```
npm i yarn -g
```

We are going to create a new folder and set up a git repo using
Yarn inside of it.

```
mkdir yarn-modern
cd yarn-modern
git init
yarn init -y
```

Running `ls -l` should show us the following files:

```
.editorconfig
.gitignore
README.md
package.json
yarn.lock
```

We need to set up our project to install our dependencies in the
`node_modules` folder. We can do that by running `yarn config set
nodeLinker: node-modules` from the terminal. That shows us the
following output:

```
➤ YN0000: Successfully set nodeLinker to 'node-modules'
```

Running that command creates a `.yarnrc.yml` file with the
following contents:

```
nodeLinker: node-modules
```

We want to commit these files. Doing so will allow us to run `git
status` to see subsequent changes in isolation. Before doing that,
we need to make a change to `.gitignore`.

Let's look at the contents of `.gitignore` first:

```
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Swap the comments on the following lines if you don't wish to
use Zero-Installs
# Documentation here: https://yarnpkg.com/features/Zero-Installs
!.yarn/cache
#.pnp.*
```

There are a number of `.yarn` folders that we do not want to
ignore. They can serve a purpose but they are beyond the scope of
this article. Looking at the bottom section, there is the
following comment:

```
# Swap the comments on the following lines if you don't wish to
# use Zero-Installs
```

By following those instructions we will turn off Zero-Installs,
which was set up for us when we ran `yarn init -y`. Turning it off
now will help us better understand how Zero-Installs works when we
enable it.

Update the bottom of the `.gitignore` to this:

```
#!.yarn/cache
.pnp.*
```

Add `node_modules` to `.gitignore` as well.

When that is done, commit the changes.

Let's add `lodash` as a dependency.

```
yarn add lodash
```

Running `git status` we should see a familiar sight:

```
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working
directory)
    modified:   package.json
    modified:   yarn.lock
```

Running `ls -l`, we see a `node_modules` folder. We also have a
`.yarn` folder. The `.yarn` folder has a `cache` folder along with
a `install-state.gz` folder. We won't be covering what
`install-state.gz` does but [you can find out more about the files
and folders that can end up in your `.yarn` folder
here.](https://yarnpkg.com/getting-started/qa#which-files-should-be-gitignored)
`.yarn/cache` holds a local, cached copy of our project
dependencies.

`ls -ls .yarn/cache` will show us something like this:

```
lodash-npm-4.17.21-6382451519-eb835a2e51.zip
```

If we were to delete `node_modules` and re-run `yarn install`, it
would load it from `.yarn/cache` instead of fetching it from the
remote repository. That is a nice touch.

Next we will create a small file in our project's root that loads
`lodash`, `index.js`.

```javascript
const _ = require("lodash");

console.log(_.camelCase("FOO_BAR_BAZ"));
```

Running `node index.js` we get the following:

```
fooBarBaz
```

As expected, we are loading `lodash` from `node_modules`. Commit
this change. Next we are going to enable Plug'n'Play.

## Adding Plug'n'Play

To add Plug'n'Play, we need to change the `nodeLinker` config
value. Run the following command in your terminal:

```
yarn config set nodeLinker pnp
```

Done successfully, that will output the following:

```
➤ YN0000: Successfully set nodeLinker to 'pnp'
```

You can also change this setting manually by opening
`.yarnrc.yml` and changing `nodeLinker` to `pnp`:

```
nodeLinker: pnp
```

Run `yarn install`. You should see the following line somewhere in
the output:

```
➤ YN0031: │ One or more node_modules have been detected and will
be removed. This operation may take some time.
```

Running `ls -l` should show that there is no longer a
`node_modules` directory. Lets make sure our `index.js` file is
still working:

```
node index.js
```

Uh oh! We got an error, that looks something like this:

```
node:internal/modules/cjs/loader:942
  throw err;
  ^

Error: Cannot find module 'lodash'
Require Stack:
...
```

Using Plug'n'Play requires using the `yarn` binary, like so:

```
yarn node index.js
```

It works! Running `yarn node index.js`, we can see `console.log`
from our `index.js` file. Instead of `node_modules`, our
dependencies are loading from `.yarn/cache` instead.

## Zero-Installs

To achieve zero-install state with Plug'n'Play, we need make an
update to `.gitignore`, replacing its contents with the following:

```
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
```

Running `git status`, you see the previously ignored Yarn cache
files along with a `.pnp.cjs` showing up as untracked files. We
will commit these files to the repo. This how we achieve
Zero-Installs, by adding our `.yarn/cache` files to the repo along
with the `.pnp.cjs` file. [Yarn's website has a good description
of what the `.pnp.cjs` file is used
for](https://yarnpkg.com/features/pnp#fixing-node_modules):

> The .pnp.cjs file contains various maps: one linking package
> names and versions to their location on the disk and another one
> linking package names and versions to their list of
> dependencies. With these lookup tables, Yarn can instantly tell
> Node where to find any package it needs to access, as long as
> they are part of the dependency tree, and as long as this file
> is loaded within your environment.

Adding your dependencies to your repo may feel strange at first
but you quickly get used to it.

---

If you are adding Plug'n'Play to a new project, you may run into
some challenges. Plug'n'Play is more strict compared to other
JavaScript package managers. This is by design. 3rd party packages
may not have listed their dependencies in a manner that works with
the strict nature of Plug'n'Play. This is either a feature or bug
of how other package managers work. It all depends on how you look
at it. Yarn Modern provides tools to tackle these challenges:
`yarn patch`, `yarn patch-commit`, and `packageDependencies`.
[There is also some additional work needed to get your IDE to work
with
Plug'n'Play.](https://yarnpkg.com/getting-started/editor-sdks#gatsby-focus-wrapper)
I will cover these topics in a future post.

Yarn with Plug'n'Play and Zero-Installs is an exciting addition to
the package manager landscape. Skipping the need to install node
modules on every build results in faster deployments. Getting the
latest dependencies is as simple as running `git pull`. While it
may seem unconventional at first, once adopted, it can increase a
team's overall productivity.
