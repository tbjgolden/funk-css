import { StatementType, Settings, Evaluation, FunctionalRule } from './types'

const numberRegex = /^[+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?$/
const rangeRegex = /^\[([+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?)( ([+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?))*\.\.([+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?)\]$/
const bracketWithUnitRegex = /\]([a-zA-Z]+|%|)$/
const containsExpandable = /[\{\}\[\]]/

type Expression =
  | {
      type: '*'
      yOffset: number
      step: number
      end: number
    }
  | {
      type: '^'
      coeffn: number
      power: number
      end: number
    }
  | {
      type: '2'
      yOffset: number
      coeff2: number
      coeff1: number
      end: number
    }

export const range = (lead: number[], end: number): number[] => {
  return generateRange(determineRange(lead, end))
}

export const determineRange = (lead: number[], end: number): Expression => {
  if (lead.length < 2) {
    const first = lead[0] ?? 1

    return {
      type: '*',
      yOffset: first,
      step: end >= first ? 1 : -1,
      end
    }
  } else if (lead.length === 2) {
    const [first, second] = lead

    return {
      type: '*',
      yOffset: first,
      step: second - first,
      end
    }
  } else {
    const [first, second, third] = lead

    const isLinear = third - second === second - first

    if (isLinear) {
      return {
        type: '*',
        yOffset: first,
        step: second - first,
        end
      }
    } else if (first !== 0 && second !== 0 && third !== 0) {
      const shouldUseFirst = Math.abs(first) < Math.abs(third)
      const scaleFactor = 1 / (shouldUseFirst ? first : third)
      const [f, s, l] = lead.map((n: number): number => n * scaleFactor)
      const squareRoot = Math.sqrt(l - s - (s - f))
      const approximation = (squareRoot * 60).toFixed(10)
      const isCloseToARoundNumber =
        parseFloat(approximation) === parseInt(approximation)

      if (isCloseToARoundNumber) {
        const power = shouldUseFirst ? squareRoot + 1 : 1 / (squareRoot + 1)

        return {
          type: '^',
          coeffn: first,
          power,
          end
        }
      }
    }

    const coeff2 = (third - second - second) / 2
    const coeff1 = second - coeff2 - first

    return {
      type: '2',
      yOffset: first,
      coeff2,
      coeff1,
      end
    }
  }
}

export const generateRange = (expr: Expression): number[] => {
  let calc: (n: number) => number

  const e = expr
  if (e.type === '*') {
    calc = (n: number): number => e.step * n + e.yOffset
  } else if (e.type === '^') {
    calc = (n: number): number => e.coeffn * e.power ** n
  } else {
    calc = (n: number): number => e.coeff2 * n * n + e.coeff1 * n + e.yOffset
  }

  const start = calc(0)
  const end = e.end
  if (start === end) return [end]

  const range: number[] = []

  let n = 0
  let curr = calc(n)
  while (start < end ? curr <= end : curr >= end) {
    range.push(curr)

    if (curr === end) {
      break
    } else {
      curr = calc(++n)
    }

    if (n > 2500) {
      throw new Error(
        'Range has generated 2500 numbers; presumably the end is unreachable'
      )
    }
  }

  return range
}

export const expandAndFlatten = (
  source: string,
  prevVariables: Map<string, string[]>,
  defaultUnit = ''
): string[] => {
  // 0 no quote, 1 single, 2 double, 3 square bracket
  const words = source.split(' ')

  const parsedWords: string[] = []

  let firstWordIndex = 0
  let quoteState = 0
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (word.length > 0) {
      const firstChar = word[0]

      if (quoteState === 0) {
        if (firstChar === "'") {
          quoteState = 1
          firstWordIndex = i
        }
        if (firstChar === '"') {
          quoteState = 2
          firstWordIndex = i
        }
        if (firstChar === '[') {
          quoteState = 3
          firstWordIndex = i
        }
      }

      if (quoteState === 0) {
        parsedWords.push(word)
      } else {
        const lastChar = word[word.length - 1]
        if (
          (quoteState === 1 && lastChar === "'") ||
          (quoteState === 2 && lastChar === '"')
        ) {
          quoteState = 0
          parsedWords.push(
            ...parseCombinations(
              words
                .slice(firstWordIndex, i + 1)
                .join(' ')
                .slice(1, -1),
              prevVariables,
              defaultUnit
            )
          )
        } else if (quoteState === 3) {
          const wordList = parseGroup(
            words.slice(firstWordIndex, i + 1).join(' '),
            prevVariables,
            defaultUnit
          )
          if (wordList !== null) {
            quoteState = 0
            parsedWords.push(...wordList)
          }
        }
      }
    }
  }

  if (quoteState !== 0) {
    throw new Error(
      `A ${
        ['', 'single-quote', 'double-quote', 'bracket'][quoteState]
      } was opened but not closed`
    )
  }

  for (let i = parsedWords.length - 1; i >= 0; i--) {
    const word = parsedWords[i]
    if (word.length > 2 && word[0] === '{' && word[word.length - 1] === '}') {
      const key = word.slice(1, -1).trim()
      parsedWords.splice(i, 1, ...(prevVariables.get(key) ?? [word]))
    } else if (containsExpandable.test(word)) {
      const wordFragments: string[] = word.split('-')
      const parts: string[][] = []

      for (const wordFragment of wordFragments) {
        if (
          wordFragment.length > 2 &&
          wordFragment[0] === '{' &&
          wordFragment[wordFragment.length - 1] === '}'
        ) {
          const key = wordFragment.slice(1, -1).trim()
          parts.push(prevVariables.get(key) ?? [wordFragment])
        } else if (wordFragment.indexOf('[') === 0) {
          parts.push(expandAndFlatten(wordFragment, prevVariables))
        } else {
          parts.push([wordFragment])
        }
      }

      parsedWords.splice(
        i,
        1,
        ...combinations(parts).map((fragments: string[]) => fragments.join('-'))
      )
    }
  }

  const withUnit = parsedWords.map(
    (word) => word + (numberRegex.test(word) ? defaultUnit : '')
  )

  return withUnit
}

export const parseGroup = (
  groupSource: string,
  prevVariables: Map<string, string[]>,
  defaultUnit: string
): null | string[] => {
  const bracketMatch = groupSource.match(bracketWithUnitRegex)
  if (bracketMatch === null) return null

  const unit: string | null = bracketMatch[1] ?? null
  if (unit) {
    // remove trailing unit for rangeRegex
    groupSource = groupSource.slice(0, -unit.length)
  }

  const mergedUnit = unit ?? defaultUnit

  let words: string[]

  if (rangeRegex.test(groupSource)) {
    const [_lead, _last] = groupSource.slice(1, -1).split('..')
    const lead = _lead.split(' ').map((n) => parseFloat(n))
    const last = parseFloat(_last)
    words = range(lead, last).map((n: number) => n + mergedUnit)
  } else {
    words = expandAndFlatten(
      groupSource.slice(1, -1),
      prevVariables,
      mergedUnit
    )
  }

  return words
}

export const parseCombinations = (
  quoted: string,
  prevVariables: Map<string, string[]>,
  defaultUnit: string
): string[] => {
  const results: string[][] = []

  const expandableRegex = /\{([^\} ]+)\}|\[[^\]]+\]([a-zA-Z]+|%)?/g
  let quoteMatch: RegExpExecArray | null
  let startOfCurrent = 0
  while ((quoteMatch = expandableRegex.exec(quoted)) !== null) {
    const toExpand = quoteMatch[0]
    const isVariable = (quoteMatch[1] ?? '').length > 0
    let values: string[] | null
    if (isVariable) {
      values = prevVariables.get(quoteMatch[1]) ?? null
    } else {
      values = parseGroup(toExpand, prevVariables, defaultUnit)
    }
    if (values !== null) {
      results.push([quoted.slice(startOfCurrent, quoteMatch.index)])
      startOfCurrent = quoteMatch.index + quoteMatch[0].length
      results.push(values)
    }
  }
  results.push([quoted.slice(startOfCurrent)])

  return combinations(results).map((combination: string[]): string =>
    combination.join('')
  )
}

// TODO: should be sorted by first prop to last
export const combinations = <T>(mods: T[][]): T[][] => {
  let list: T[][] = [[]]
  let index = 0
  while (index < mods.length) {
    list = mods[index++].flatMap((option) =>
      list.map((prev) => prev.concat([option]))
    )
  }
  return list
}

// strips comments, checks syntax and determines line types
// same as js - except `://` is not a block comment
export const stripComments = (fcss: string): string => {
  let curr = ''
  let inBlockComment = false
  let inLineComment = false
  for (let i = 0; i < fcss.length; i++) {
    const c0 = fcss.charAt(i)
    const c1 = i < fcss.length - 1 ? fcss.charAt(i + 1) : ''

    if (inBlockComment) {
      if (c0 === '*' && c1 === '/') {
        inBlockComment = false
        i += 1
      }
      continue
    } else if (inLineComment) {
      if (c1 === '\n') {
        inLineComment = false
      }
      continue
    }

    if (c0 === '/' && c1 === '/') {
      if (i === 0 || fcss.charAt(i - 1) !== ':') {
        // line comment
        inLineComment = true
        i += 1
        continue
      }
    } else if (c0 === '/' && c1 === '*') {
      // block comment
      inBlockComment = true
      i += 1
      continue
    }

    curr += c0
  }

  if (inBlockComment) {
    throw new Error('Block comment opened but not closed')
  }

  return curr
}

const assignmentRegex = /^([^\[\]\{\}\(\) \t]+)[ \t]*=(%|[a-zA-Z]+|)[ \t]+(.*)$/
const settingRegex = /^%([^: \t]+)[ \t]*:[ \t]+(.*)$/
const atRuleRegex = /^@([a-z\-]+)[ \t]*(.*)$/
const declarationRegex = /^([^:\n]+):[ \t]*([^;\n]+)(;[ \t]*([^:\n]+)[ \t]*:[ \t]*([^;\n]+))*$/

const urlRegex = /^((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)$/

export const parseStatements = (fcss: string): [StatementType, string][] => {
  const results: [StatementType, string][] = []
  // non-empty lines without comments
  const lines = stripComments(fcss)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    if (line.startsWith('%')) {
      results.push(['setting', line])
    } else if (line.startsWith('@')) {
      results.push(['at-rule', line])
    } else if (assignmentRegex.test(line)) {
      results.push(['assignment', line])
    } else if (declarationRegex.test(line)) {
      results.push(['declaration', line])
    } else {
      throw new Error(`Invalid syntax`)
    }
  }

  return results
}

const defaultSettings = {
  breakpoints: [],
  pseudo: ['all']
}

const validSettings = new Set(Object.keys(defaultSettings))

export const evaluate = (fcss: string): Evaluation => {
  const settings: Settings = defaultSettings
  const variables = new Map<string, string[]>()
  const functionalRules: FunctionalRule[] = []

  for (const [type, statement] of parseStatements(fcss)) {
    if (type === 'assignment') {
      const [, variableName, unit, value] = statement.match(
        assignmentRegex
      ) as [never, string, string, string]

      variables.set(variableName, expandAndFlatten(value, variables, unit))
    } else if (type === 'at-rule') {
      const atRuleMatchArray = statement.match(atRuleRegex)
      if (!atRuleMatchArray) throw new Error('Invalid syntax for at-rule')

      const [, atRule, value] = atRuleMatchArray

      if (atRule === 'import') {
        if (urlRegex.test(value)) {
          // import urlRegex
        } else {
          throw new Error(`Invalid URL for @import`)
        }
      } else {
        throw new Error(`No support for at-rule "@${atRule}"`)
      }
    } else if (type === 'setting') {
      const settingMatchArray = statement.match(settingRegex)
      if (!settingMatchArray) throw new Error('Invalid syntax for setting')

      const [, setting, value] = settingMatchArray

      if (validSettings.has(setting)) {
        const validSetting = setting as keyof Settings
        settings[validSetting] = expandAndFlatten(value, variables)
      } else {
        throw new Error(`Unknown setting "${setting}"`)
      }
    } else {
      // declaration or invalid syntax
      const declarationGroup = statement.split(';').map((s: string) => s.trim())

      const extra: [string, string][] = []

      for (let i = 1; i < declarationGroup.length; i++) {
        const declaration = declarationGroup[i]
        const declarationMatchArray = declaration.match(declarationRegex)
        if (!declarationMatchArray) throw new Error('Invalid syntax')

        const [, rawProperty, rawValue] = declarationMatchArray as [
          never,
          string,
          string
        ]

        extra.push([rawProperty.trim(), rawValue.trim()])
      }

      const declaration = declarationGroup[0]
      const declarationMatchArray = declaration.match(declarationRegex)
      if (!declarationMatchArray) throw new Error('Invalid syntax')

      const [, rawProperty, rawValue] = declarationMatchArray as [
        never,
        string,
        string
      ]

      const property = rawProperty.trim()
      const value = rawValue.trim()

      const declarations = combinations([
        expandAndFlatten(property, variables),
        expandAndFlatten(value, variables)
      ]) as [string, string][]

      functionalRules.push(
        ...declarations.map(
          ([property, value]): FunctionalRule => {
            const rule: FunctionalRule = {
              property,
              value
            }
            if (extra.length > 0) {
              rule.extra = extra
            }
            return rule
          }
        )
      )
    }
  }

  functionalRules.sort(
    ({ property: p1, value: v1 }, { property: p2, value: v2 }) => {
      if (p1 === p2) {
        return v1 > v2 ? 1 : -1
      }
      return p1 > p2 ? 1 : -1
    }
  )

  return {
    settings,
    functionalRules,
    prelude: ''
  }
}
