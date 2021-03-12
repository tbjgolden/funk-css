import { generate, getPropertyAbbreviation } from '.'

import fs from 'fs'
import path from 'path'

const fixture = (str: string): string =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', str), 'utf8')

test('generate', () => {
  expect(generate(JSON.parse(fixture('a.json')))).toEqual(fixture('a.css'))
})

test('getPropertyAbbreviation', () => {
  const propertyAbbreviations = JSON.parse(
    fixture('propertyAbbreviations.json')
  )

  const results: Record<string, string> = {}
  for (const property of Object.keys(propertyAbbreviations)) {
    results[property] = getPropertyAbbreviation(property)
  }

  expect(results).toEqual(propertyAbbreviations)
  expect(Object.keys(results).length).toBe(Object.values(results).length)
})
