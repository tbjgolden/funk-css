import { normalizeStylesheet } from './index'
import fs from 'fs'
import path from 'path'

const fixture = (str: string): string =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', str), 'utf8')

test('normalize', () => {
  const normalizedStylesheet = normalizeStylesheet(fixture('test.min.css'))
  fs.writeFileSync(
    path.join(__dirname, '__fixtures__', 'test.norm.css'),
    normalizedStylesheet
  )

  expect(normalizedStylesheet).not.toBe('')
})
