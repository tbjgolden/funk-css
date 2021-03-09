#!/usr/bin/env node

const asyncWrapper = async () => {
  const fs = require('fs')
  const path = require('path')
  const { parse, walk, generate } = require('css-tree')
  const processor = require('postcss')([ require('./expand-shorthand')(), require('cssnano')({
    preset: 'default'
  })])

  const cssBundle = fs.readFileSync(path.join(__dirname, '2021-03.css'), 'utf8')

  const propIncludedMap = new Map();
  for (const line of cssBundle.split("\n")) {
    const propertyMap = new Map()
    if (line.length > 0) {
      // normalize the css
      // console.log(line.slice(0, 100) + "...")
      // console.log(line.length)
      const { css } = await processor.process(line, { from: undefined })
      const ast = parse(css)
      walk(ast, {
        visit: 'Declaration',
        enter(node) {
          propertyMap.set(node.property, (propertyMap.get(node.property) ?? 0) + 1)
        }
      });
      const properties = [...propertyMap.entries()].sort(([, a], [, b]) => b - a)
      for (const [property] of properties) {
        propIncludedMap.set(property, (propIncludedMap.get(property) ?? 0) + 1)
      }
    }
  }

  const fullPropertyList = ([...propIncludedMap.entries()].sort(([, a], [, b]) => b - a))

  const vendorPrefixed = []

  const fragmentAbbreviationMap = new Map()
  const propertyAbbreviationMap = new Map()

  for (const [prop, count] of fullPropertyList) {
    if (prop.startsWith('--')) continue;
    if (prop.startsWith('-')) {
      vendorPrefixed.push(prop);
      continue;
    }

    if (count > 1) {
      const abbrev = prop.split('-').map(frag => {
        const abbrev = frag.slice(0, 1)
        fragmentAbbreviationMap.set(abbrev, [...new Set([...(fragmentAbbreviationMap.get(abbrev) ?? []), frag])])
        return abbrev
      }).join("")
      propertyAbbreviationMap.set(abbrev, [...(propertyAbbreviationMap.get(abbrev) ?? []), prop])
    }
  }

  // console.log(vendorPrefixed)
  // console.log(propertyAbbreviationMap)
  console.log([...fragmentAbbreviationMap.entries()].filter(([, arr]) => arr.length > 1))
  console.log([...propertyAbbreviationMap.entries()].sort(([, a], [, b]) => b.length - a.length))
}

asyncWrapper()
