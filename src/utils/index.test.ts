import { isValidDeclaration } from '.'
import fs from 'fs'
import path from 'path'

const fixture = (str: string): string =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', str), 'utf8')

test('isValidDeclaration', () => {
  for (const [p, v, expected] of JSON.parse(fixture('test.json'))) {
    expect(isValidDeclaration(p, v)).toBe(expected)
  }
})
