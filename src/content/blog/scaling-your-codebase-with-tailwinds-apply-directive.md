---
title: "Scaling Your Codebase with Tailwind CSS's @apply
Directive"
description: "Lorem ipsum dolor sit amet"
pubDate: "Jun 15 2023"
previewCode: "
.link {\n
\t@apply text-orange-600 hover:text-orange-900; focus:text-orange-900\n
}\n

.large-sub-header {\n
\t@apply font-sans font-semibold text-lg text-stone-600;\n
}\n

.grid-layout {\n
\t@apply grid gap-3;\n
}\n"
---

When it comes to rapidly building features, Tailwind CSS's
utility-first approach enables engineers to move fast. However, as
a code base grows in size and complexity, that utility-first
approach can encounter challenges with scaling. One approach to
circumvent these issues is to use Tailwind's `@apply` directive to
create custom classes.

## Utility-first Approach

A site can have page headers, sub-headers, and standard body copy.
These may require some combination of `color`, `font-face`,
`font-size`, `font-weight` and `line-height` styles. Using
Tailwind, we could implement a "large sub-header" like this:

```html
<h2 class="font-sans font-semibold text-lg text-stone-600"></h2>
```

Scaling this is problematic. Copying the 4 classes above and
pasting them anywhere you need a large sub-header is not optimal.

## Using the `@apply` directive

Tailwind's documentation describes the `@apply` directive as
providing the ability to ["to inline any existing utility classes
into your own custom
CSS."](https://tailwindcss.com/docs/functions-and-directives#apply)
Using the `@apply` directive, we can create a custom large
sub-header class:

```sass
.large-sub-header {
  @apply font-sans font-semibold text-lg text-stone-600;
}
```

With the same tokens used for the classes, we can add those styles
to our custom class name. We can now use `.large-sub-header` class
anywhere we need a large sub-header.

```html
<h2 class="large-sub-header"></h2>
```

When the inevitable change comes to update the styles for large
sub-headers, we only have to make the change in one place.

## State Variants

`@apply` allows you to use state variants. Here is a "link" class
that uses the `hover:` variant:

```sass
.link {
  @apply text-orange-600 hover:text-orange-900
}
```

All state variants are available to the `@apply` directive. For
`.large-subheader`, we want to apply `text-md` on small screens.

```sass
.large-sub-header {
  @apply font-sans font-semibold text-lg text-stone-600
xs:text-md;
}
```

By adding `xs:text-md` to our custom class, we made it responsive
without losing the benefits that come with using Tailwind.

## `!important`

One limitation of the `@apply` directive is that the styles are
added without `!important`. This is done to avoid specificity
issues. To apply `!important` to an `@apply` directive is done the
same way you would apply `!important` to CSS property.

```sass
.large-sub-header {
  @apply font-sans font-semibold text-lg text-stone-600
!important;
}
```

---

While Tailwind CSS is great at providing all of the utility
classes one needs, over reliance upon them can result in issues
down the road. A well implemented site is one that is easy to
update. Using Tailwind's `@apply` to combine your patterns into
custom classes can help with those scaling efforts.
