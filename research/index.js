#!/usr/bin/env node

const mapFragToAbbrev = (frag) => {
  const o = {
    "align": "A",
    "background": "B",
    "color": "C",
    "display": "D",
    "font": "F",
    "height": "H",
    "margin": "M",
    "padding": "P",
    "overflow": "O",
    "style": "S",
    "text": "T",
    "bottom": "V",
    "width": "W",
    "x": "X",
    "y": "Y",
    "z": "Z",

    "border": "|",
    "flex": "*",
    "grid": "#",
    "position": "+",
    "transform": "!",
    "transition": "~",

    "top": "^",
    "right": ">",
    "left": "<",
  }

  return o[frag] || frag.slice(0, 3)
}

const asyncWrapper = async () => {
  const fs = require('fs')
  const path = require('path')
  const fullPropertyList = fs.readFileSync(path.join(__dirname, 'properties.txt'), 'utf8').split("\n").filter(Boolean)

  const fragmentAbbreviationMap = new Map()
  const propertyAbbreviationMap = new Map()

  for (const prop of fullPropertyList) {
    const fullAbbrev = prop.split('-').map(frag => {
      if (frag.length < 3) console.log(frag)

      const abbrev = mapFragToAbbrev(frag)
      let prevMap = fragmentAbbreviationMap.get(abbrev)
      if (!prevMap) {
        prevMap = new Map()
        fragmentAbbreviationMap.set(abbrev, prevMap)
      }
      prevMap.set(frag, [...(prevMap.get(frag) ?? []), prop])

      return abbrev
    }).join("")
    propertyAbbreviationMap.set(fullAbbrev, [...(propertyAbbreviationMap.get(fullAbbrev) ?? []), prop])
  }

  console.log([...propertyAbbreviationMap.entries()].filter(x => x[1].length > 1));

  console.log(
    [...fragmentAbbreviationMap.entries()]
      .sort((a, b) => a[0] > b[0] ? -1 : 1)
      .filter(a => a[0].length !== 1 && [...a[1].values()].flat().length > 1)
      .map(a => [a[0], [...a[1].values()].flat()])
      .sort((a, b) => a[1].length > b[1].length ? -1 : 1)
      .filter(a => /^[EGIJKLNQRU]/i.test(a[0]))
      .map(a => [a[0] + " (" + a[1].length + ")", a[1].join(" ")].join("\n "))
      .join("\n")
  )
}

asyncWrapper()
