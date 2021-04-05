import { parseRules, normalizeCSS, parse } from '.'

import fs from 'fs'
import path from 'path'

const fixture = (str: string): string =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', str), 'utf8')

test('parseRules', () => {
  expect(parseRules(fixture('parser.test.css'))).toEqual([
    ['.black', 'color', '#000'],
    ['.lightgray', 'background-color', '#000'],
    ['.lightgray', 'color', '#d3d3d3'],
    ['@charset "UTF-8"'],
    ['@font-face', 'font-family', "'MyWebFont'"],
    [
      '@font-face',
      'src',
      "url(myfont.woff2) format('woff2'),url(myfont.woff) format('woff')"
    ],
    ["@import 'global.css'"],
    ['@keyframes pulse', '0%', 'background-color', '#001f3f'],
    ['@keyframes pulse', 'to', 'background-color', '#ff4136'],
    ['@media (min-width:384px) and screen', '.blue', 'color', '#00f'],
    ['@media (min-width:384px) and screen', '.yellow', 'color', '#ff0'],
    [
      '@media (min-width:384px) and screen',
      '@media (max-width:768px)',
      '.green',
      'color',
      'green'
    ],
    ['@media (min-width:768px)', '.white', 'color', '#fff'],
    ['@page :first', 'margin', '1in'],
    [
      '@supports (display:flex) and (-webkit-appearance:checkbox)',
      '.red',
      'color',
      'red'
    ]
  ])
})

test('normalizeCSS', async () => {
  const actual = await normalizeCSS(fixture('bootstrap.css'))
  const expected = fixture('bootstrap.norm.css').trim()
  expect(actual).toBe(expected)
})

test('parse', async () => {
  const actual = await parse(fixture('bootstrap.css'))
  fs.writeFileSync('a.json', JSON.stringify(actual, null, 2))
  const expected = JSON.parse(fixture('bootstrap.norm.json'))
  expect(actual).toEqual(expected)
})
