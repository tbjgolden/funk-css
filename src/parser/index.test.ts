import {
  expandAndFlatten,
  range,
  combinations,
  parseCombinations,
  stripComments,
  parseStatements,
  evaluate
} from '.'

import fs from 'fs'
import path from 'path'

const fixture = (str: string): string =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', str), 'utf8')

test('range', () => {
  expect(range([1], 1)).toEqual([1])
  expect(range([1], -1)).toEqual([1, 0, -1])
  expect(range([3], 10)).toEqual([3, 4, 5, 6, 7, 8, 9, 10])
  expect(range([1, 3], 20)).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19])
  expect(range([0, 5], 20)).toEqual([0, 5, 10, 15, 20])
  expect(range([0.25, 0.5], 1)).toEqual([0.25, 0.5, 0.75, 1])
  expect(range([-0.25, -0.5], -1)).toEqual([-0.25, -0.5, -0.75, -1])
  expect(range([0, 1, 2], 5)).toEqual([0, 1, 2, 3, 4, 5])
  expect(range([0, 1, 3], 50)).toEqual([0, 1, 3, 6, 10, 15, 21, 28, 36, 45])
  expect(range([1, 2, 4], 50)).toEqual([1, 2, 4, 8, 16, 32])
  expect(range([4, 8, 16], 50)).toEqual([4, 8, 16, 32])
  expect(() => range([1, 2], -1)).toThrow()
})

const scale = '0px 100% 100vh 100vw 1024px 11111111px 128px 12px 1536px 16px 192px 1px 24px 256px 2px 32px 384px 3px 48px 4px 50% 512px 64px 6px 768px 8px 96px'.split(
  ' '
)
const negScale = '-100% -100vh -100vw -1024px -11111111px -128px -12px -1536px -16px -192px -1px -24px -256px -2px -32px -384px -3px -48px -4px -50% -512px -64px -6px -768px -8px -96px'.split(
  ' '
)

test('expandAndFlatten simple lists', () => {
  const emptyVars = new Map<string, string[]>([])
  expect(expandAndFlatten('24 "16 12"', emptyVars)).toEqual(['24', '16 12'])
  expect(expandAndFlatten('24 16 12', emptyVars, 'px')).toEqual([
    '24px',
    '16px',
    '12px'
  ])
  expect(expandAndFlatten('64 48 32', emptyVars, 'px')).toEqual([
    '64px',
    '48px',
    '32px'
  ])
  expect(expandAndFlatten('hidden scroll auto visible', emptyVars)).toEqual([
    'hidden',
    'scroll',
    'auto',
    'visible'
  ])
})

test('expandAndFlatten variables and expansion', () => {
  const emptyVars = new Map<string, string[]>([])
  const withScale = new Map([['scale', scale]])
  expect(expandAndFlatten('24 "16 12"', emptyVars)).toEqual(['24', '16 12'])
  expect(expandAndFlatten('24 16 12', emptyVars, 'px')).toEqual([
    '24px',
    '16px',
    '12px'
  ])
  expect(expandAndFlatten('64 48 32', emptyVars, 'px')).toEqual([
    '64px',
    '48px',
    '32px'
  ])
  expect(expandAndFlatten('hidden scroll auto visible', emptyVars)).toEqual([
    'hidden',
    'scroll',
    'auto',
    'visible'
  ])
  expect(
    expandAndFlatten('1 [6 36 216..2000]rem', emptyVars, 'px').sort()
  ).toEqual(['1296rem', '1px', '216rem', '36rem', '6rem'])
  expect(
    expandAndFlatten(
      '0 1 2 3 [4 8 16..1024] [6 12 24..1536] 11111111 50% 100% 100vh 100vw',
      emptyVars,
      'px'
    ).sort()
  ).toEqual(scale)
  expect(expandAndFlatten('{scale}', withScale, 'px').sort()).toEqual(
    scale.sort()
  )
  expect(
    expandAndFlatten(
      '{scale} -1 -2 -3 [-4 -8 -16..-1024] [-6 -12 -24..-1536] -11111111 -50% -100% -100vh -100vw',
      withScale,
      'px'
    ).sort()
  ).toEqual([...scale, ...negScale].sort())
  expect(
    expandAndFlatten('[width height top left down right]', emptyVars)
  ).toEqual(['width', 'height', 'top', 'left', 'down', 'right'])
  expect(expandAndFlatten('[0 1 auto]', emptyVars)).toEqual(['0', '1', 'auto'])
  expect(expandAndFlatten('"[0 1] [0 1] [0 auto]"', emptyVars)).toEqual([
    '0 0 0',
    '1 0 0',
    '0 1 0',
    '1 1 0',
    '0 0 auto',
    '1 0 auto',
    '0 1 auto',
    '1 1 auto'
  ])
  expect(
    expandAndFlatten('1 2 [3 4 auto]em [5 6]rem', emptyVars, 'px')
  ).toEqual(['1px', '2px', '3em', '4em', 'auto', '5rem', '6rem'])
})

test('combinations', () => {
  const ogTestArr = [
    [1, 2],
    [3, 4],
    [5, 6, 7]
  ]
  const result = combinations(ogTestArr)

  expect(result).not.toBe(ogTestArr)
  expect(result).toEqual([
    [1, 3, 5],
    [2, 3, 5],
    [1, 4, 5],
    [2, 4, 5],
    [1, 3, 6],
    [2, 3, 6],
    [1, 4, 6],
    [2, 4, 6],
    [1, 3, 7],
    [2, 3, 7],
    [1, 4, 7],
    [2, 4, 7]
  ])
  expect(combinations([])).toEqual([[]])
  expect(combinations([[1], [2], [3]])).toEqual([[1, 2, 3]])
})

test('parseCombinations', () => {
  const vars = new Map<string, string[]>([
    ['alpha', ['beta']],
    ['gamma', ['a', 'b', 'c']]
  ])
  expect(parseCombinations('{alpha}', vars, '')).toEqual(['beta'])
  expect(parseCombinations(' {alpha}', vars, '')).toEqual([' beta'])
  expect(parseCombinations('{beta}', vars, '')).toEqual(['{beta}'])
  expect(parseCombinations(' {beta}', vars, '')).toEqual([' {beta}'])
  expect(parseCombinations('{beta}', vars, '')).toEqual(['{beta}'])
  expect(parseCombinations(' {beta}', vars, '')).toEqual([' {beta}'])
  expect(parseCombinations('{gamma}', vars, '')).toEqual(['a', 'b', 'c'])
  expect(parseCombinations('{gamma} {gamma}', vars, '')).toEqual([
    'a a',
    'b a',
    'c a',
    'a b',
    'b b',
    'c b',
    'a c',
    'b c',
    'c c'
  ])
  expect(
    parseCombinations('alpha:{alpha} beta:{beta} gamma:{gamma}', vars, '')
  ).toEqual([
    'alpha:beta beta:{beta} gamma:a',
    'alpha:beta beta:{beta} gamma:b',
    'alpha:beta beta:{beta} gamma:c'
  ])
})

test('stripComments', () => {
  expect(stripComments(``)).toBe(``)

  expect(stripComments(`aaa`)).toBe(`aaa`)
  expect(stripComments(`aa\na`)).toBe(`aa\na`)
  expect(stripComments(`aa\n//a`)).toBe(`aa\n`)
  expect(stripComments(`aa\n/*a*/`)).toBe(`aa\n`)
  expect(stripComments(`aa\n/*a*/\n`)).toBe(`aa\n\n`)

  expect(stripComments(`//a\na`)).toBe(`\na`)
  expect(stripComments(`/*a*/a\na`)).toBe(`a\na`)
  expect(stripComments(`/*a*/aa\n\n`)).toBe(`aa\n\n`)
  expect(stripComments(`//a\na`)).toBe(`\na`)
  expect(stripComments(`/*a*/a\na`)).toBe(`a\na`)

  expect(stripComments(`https://tom.bio\n`)).toBe(`https://tom.bio\n`)
  expect(stripComments(`https //tom.bio\n`)).toBe(`https \n`)
  expect(stripComments(`https //tom.bio\n`)).toBe(`https \n`)

  expect(() => stripComments(`/*aaa\n\n`)).toThrow()
  expect(() => stripComments(`aa/*aaa\n\n`)).toThrow()

  expect(stripComments(fixture('a.fcss'))).toBe(
    fixture('a.withoutComments.fcss')
  )
})

test('parseStatements', () => {
  expect(parseStatements(``)).toEqual([])
  expect(parseStatements(fixture('a.fcss'))).toEqual(
    JSON.parse(fixture('a.statements.json'))
  )
})

test('evaluate', () => {
  expect(evaluate(fixture('a.fcss'))).toEqual(
    JSON.parse(fixture('a.rules.json'))
  )
})
