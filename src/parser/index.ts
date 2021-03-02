const numberRegex = /^[+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?$/
const rangeRegex = /^\[([+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?)( ([+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?))*\.\.([+-]?(\d+|\d*\.\d+)([eE][+-]?\d+)?)\]$/

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
  str: string,
  prevVariables: Map<string, string[]>,
  defaultUnit = ''
): string[] => {
  // 0 no quote, 1 single, 2 double, 3 square bracket
  const words = str.split(' ')

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
        parsedWords.push(words[i])
      } else {
        const lastChar = word[word.length - 1]
        if (quoteState === 1 && lastChar === "'") {
          quoteState = 0
          parsedWords.push(
            words
              .slice(firstWordIndex, i + 1)
              .join(' ')
              .slice(1, -1)
          )
        }
        if (quoteState === 2 && lastChar === '"') {
          quoteState = 0
          parsedWords.push(
            words
              .slice(firstWordIndex, i + 1)
              .join(' ')
              .slice(1, -1)
          )
        }
        if (quoteState === 3 && lastChar === ']') {
          quoteState = 0
          const listSource = words.slice(firstWordIndex, i + 1).join(' ')

          if (rangeRegex.test(listSource)) {
            const [_lead, _last] = listSource.slice(1, -1).split('..')
            const lead = _lead.split(' ').map((n) => parseFloat(n))
            const last = parseFloat(_last)
            parsedWords.push(
              ...range(lead, last).map((n: number) => n.toString())
            )
          } else {
            parsedWords.push(
              ...expandAndFlatten(
                listSource.slice(1, -1),
                prevVariables,
                defaultUnit
              )
            )
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
      const variableValue = prevVariables.get(word.slice(1, -1))
      if (variableValue !== undefined) {
        parsedWords.splice(i, 1, ...variableValue)
      }
    }
  }

  const withUnit = parsedWords.map(
    (word) => word + (numberRegex.test(word) ? defaultUnit : '')
  )

  return withUnit
}
