import { generate } from '.'

import fs from 'fs'
import path from 'path'

const fixture = (str: string): string =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', str), 'utf8')

test('generate', () => {
  expect(generate(JSON.parse(fixture('a.json')))).toEqual(fixture('a.css'))
})
