export type StatementType = 'setting' | 'assignment' | 'at-rule' | 'declaration'

export type Settings = {
  breakpoints: string[]
  pseudo: string[]
}

export type Evaluation = {
  settings: Settings
  functionalRules: FunctionalRule[]
  prelude: string
}

export type FunctionalRule = {
  property: string
  value: string
  extra?: [string, string][]
}

export type Expression =
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
