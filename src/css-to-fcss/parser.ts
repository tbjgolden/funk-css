import csso from 'csso'
// @ts-ignore
import csstree, {
  toPlainObject,
  StyleSheetPlain,
  BlockPlain,
  CssNode
} from 'css-tree'
import postcss, { AcceptedPlugin } from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'
import postcssShorthandExpand from '../utils/postcss-shorthand-expand'
// @ts-ignore
import postcssColorNorm from 'postcss-colornorm'
import cssnano from 'cssnano'

export const parseRules = (css: string): string[][] => {
  const minifiedCSS = csso.minify(css).css

  const list: string[][] = []
  const ast = toPlainObject(csstree.parse(minifiedCSS))
  normalizeBlock(
    ast as StyleSheetPlain,
    (path) => {
      list.push(path)
    },
    []
  )

  return list
    .map((path): [string[], string] => [path, JSON.stringify(path)])
    .sort(([, jsonPathA], [, jsonPathB]) => (jsonPathA > jsonPathB ? 1 : -1))
    .map(([path]) => path)
}

const normalizeBlock = (
  node: StyleSheetPlain | BlockPlain,
  addPath: (path: string[]) => void,
  path: string[]
) =>
  node.children
    .map((child) => {
      if (child.type === 'Atrule') {
        let atruleprelude = `@${child.name}`
        if (child.prelude !== null) {
          atruleprelude += ` ${csstree.generate(child.prelude as CssNode)}`
        }

        if (child.block === null) {
          addPath([...path, atruleprelude])
        } else {
          normalizeBlock(child.block, addPath, [...path, atruleprelude])
        }
      } else if (
        child.type === 'Rule' &&
        child.prelude.type === 'SelectorList'
      ) {
        const selectors = child.prelude.children
          .filter((child) => child.type === 'Selector')
          .map((selector) => csstree.generate(selector as CssNode))

        selectors.map((selector) => {
          normalizeBlock(child.block, addPath, [...path, selector])
        })
      } else if (child.type === 'Declaration') {
        addPath([
          ...path,
          child.property,
          csstree.generate(child.value as CssNode)
        ])
      }
    })
    .filter(Boolean)

const processor = postcss([
  postcssCustomProperties({
    preserve: false
  }) as AcceptedPlugin,
  cssnano({
    preset: 'advanced'
  }) as AcceptedPlugin,
  postcssColorNorm({
    output: 'hsl'
  }) as AcceptedPlugin,
  postcssShorthandExpand()
])

export const normalizeCSS = async (css: string): Promise<string> =>
  (await processor.process(css)).css

export const parse = async (css: string): Promise<string[][]> =>
  parseRules(await normalizeCSS(css))
