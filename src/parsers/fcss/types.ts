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
