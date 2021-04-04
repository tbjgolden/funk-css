import { walk, parse, Raw, generate } from 'css-tree'
import { getAllValidDeclarations } from '../utils'

export const to = (css: string) => {
  getAllValidDeclarations(css)
  return generate(ast)
}

// let maxb = 1;
// const normalizeValue = (property: string, value: string) => {
//   if (maxb > 0) {
//     if (propertyData)
//     console.log(propertyData)
//     console.log(JSON.stringify(value))
//   }
//   const normalizedValue = value
//   if (maxb-- > 0) {
//     console.log(JSON.stringify(normalizedValue))
//   }
//   return normalizedValue
// }

/*
List

Dimension
Function
Hash
Identifier
Number
Operator
Percentage
Raw
String
UnicodeRange
Url
WhiteSpace
*/
