import { Evaluation } from '../types'

export const generate = (evaluation: Evaluation): string => {
  console.log(evaluation)
  return ''
}

export const fragmentMap = new Map<string, string>(
  Object.entries({
    align: 'A',
    background: 'B',
    color: 'C',
    display: 'D',
    font: 'F',
    height: 'H',
    margin: 'M',
    padding: 'P',
    overflow: 'O',
    style: 'S',
    text: 'T',
    width: 'W',
    x: 'X',
    y: 'Y',
    z: 'Z',

    border: '|',
    flex: '*',
    grid: '#',
    position: '+',
    transform: '!',
    transition: '~',

    top: '^',
    right: '>',
    left: '<',
    bottom: 'V'
  })
)

export const getPropertyAbbreviation = (property: string): string => {
  return property
    .split('-')
    .map((fragment) => {
      const fragmentAbbreviation = fragmentMap.get(fragment)
      if (fragmentAbbreviation) return fragmentAbbreviation

      const defaultAbbrev =
        fragment.slice(0, 1).toUpperCase() + fragment.slice(1, 3).toLowerCase()
      return defaultAbbrev
    })
    .join('')
}
