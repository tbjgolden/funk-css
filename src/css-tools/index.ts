// @ts-ignore
import { parse, lexer, walk, Raw } from 'css-tree'
import postcss, { AcceptedPlugin } from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
// @ts-ignore
import postcssColorNorm from 'postcss-colornorm'
import cssnano from 'cssnano'

const isValidPropertyNameRegex = /^-?([_a-z\u0100-\uffff]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])([_a-z0-9\-\u0100-\uffff]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*$/iu

const containsCommonBrowserHack = /\\[0-9]|DXImageTransform|expression\(/g

// assumes no CSS variables (i.e. they have already been substituted for values)
export const isValidDeclaration = (property: string, value: string) => {
  if (containsCommonBrowserHack.test(value)) return false
  if (!isValidPropertyNameRegex.test(property)) return false

  try {
    const parsedValue = parse(value, {
      context: 'value'
    })

    const { error } = lexer.matchProperty(property, parsedValue)
    if (error) {
      if (
        error.name === 'SyntaxMatchError' ||
        error.name === 'SyntaxReferenceError'
      ) {
      }
      return false
    }
  } catch (error) {
    return false
  }

  return true
}

// assumes no CSS variables (i.e. they have already been substituted for values)
export const getAllValidDeclarations = (css: string): [string, string][] => {
  const ast = parse(css, { parseValue: false })

  const declarations: [string, string][] = []
  walk(ast, {
    visit: 'Declaration',
    enter: (node) => {
      const property = node.property
      const value = (node.value as Raw).value

      if (isValidDeclaration(property, value)) {
        declarations.push([property, value])
      }
    }
  })

  return declarations
}

const processor = postcss([
  postcssCustomProperties({
    preserve: false
  }) as AcceptedPlugin,
  cssnano({
    preset: 'advanced'
  }) as AcceptedPlugin,
  postcssColorNorm({
    output: 'hsl'
  }) as AcceptedPlugin
])
export const normalizeCSS = async (css: string): Promise<string> => {
  return (await processor.process(css)).css
}
