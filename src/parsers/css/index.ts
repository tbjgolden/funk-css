import { walk, parse, Raw, generate, lexer } from 'css-tree'

export const normalizeStylesheet = (css: string) => {
  const ast = parse(css, { parseValue: false })
  walk(ast, {
    visit: 'Declaration',
    leave: (node) => {
      const { value } = node.value as Raw
      validateDeclaration(node.property, value)
      // const normalizedValue = normalizeValue(node.property,  value)
      // node.value = {
      //   ...(node.value as Raw),
      //   value: normalizedValue
      // }
    }
  })
  return generate(ast)
}

let maxa = 1
const validateDeclaration = (property: string, value: string) => {
  const propData = propertyData[property.toLowerCase()]
  if (propData === undefined) return false
  const { syntax } = propData
  if (maxa-- > 0) {
    console.log(syntax)
    console.log(value)
  }
  return true
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
