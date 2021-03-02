# `funk-css`

**Functional CSS Preprocessor**

[![npm version](https://img.shields.io/npm/v/funk-css.svg?style=flat-square)](https://www.npmjs.com/package/funk-css)
[![test coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&color=brightgreen&label=coverage&query=%24.total.branches.pct&suffix=%25&url=https%3A%2F%2Funpkg.com%2Ffunk-css%2Fcoverage%2Fcoverage-summary.json)](https://www.npmjs.com/package/funk-css)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tbjgolden/funk-css/Release?style=flat-square)](https://github.com/tbjgolden/funk-css/actions?query=workflow%3ARelease)

> **A preprocessor built for functional CSS**

```none
[ Funk ] <-> [ CSS ] <---> [ JS ]
                |            |
                '->[ HTML ]<-'
```

Functional CSS (also known as Atomic/Utility) - is the principle of creating a
stylesheet that largely follows a 1 CSS property-value pair to 1 CSS class
relationship.

This single constraint has some very useful qualities:

- predictable class names that are easy to remember
- massive CSS size benefits
- far easier to review each others styling code
- consistency and conformity

However, other CSS preprocessors do not make great solutions for this, as they:

- require you to work out the right class name for each property-value pair
- leave plenty of room for you to get this wrong

---

- [ ] EBNF / formal spec
- [ ] syntax highlighting
- [ ] prettier plugin
- [ ] sourcemap generation

---

The following is the API that this will use - though the project is a work in
progress.

## Installation

```sh
npm install funk-css --save
# yarn add funk-css
```

Alternatively, there are also client web builds available:

<!-- IMPORTANT: Do not delete or change the comments in the code block below -->

```html
<!-- Dependencies -->

<!-- window.FunkCSS -->
<script src="https://unpkg.com/funk-css/dist/funk-css.umd.js"></script>
```

## Documentation

- [`Docs`](docs)
- [`API`](docs/api)

## Contribute

> I've been trying to find the right way to solve this for years now:
>
> - [My initial research on this when building an in-house version of Tachyons](https://github.com/tbjgolden/css-is-gr9)
> - [The initial version of a recursive CSS decompression algorithm](https://github.com/tbjgolden/cssinjson)
> - [That algorithm as a specced out JSON encoded language](https://github.com/tbjgolden/ainsley)

If this sounds like an exciting project and you'd like to help out - reach out!
😊

## License

MIT

<!-- Original starter readme: https://github.com/tbjgolden/create-typescript-react-library -->
