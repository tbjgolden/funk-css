import { PluginCreator } from 'postcss'
import {
  isShorthandProperty,
  expandShorthandProperty
} from 'css-property-parser'

const plugin: PluginCreator<undefined> = () => {
  return {
    postcssPlugin: 'postcss-shorthand-expand',
    Declaration(decl) {
      try {
        if (isShorthandProperty(decl.prop)) {
          const expansion = expandShorthandProperty(decl.prop, decl.value, true)
          const entries = Object.entries(expansion)
          if (
            entries.length > 2 ||
            (entries.length === 1 &&
              (entries[0][0] !== decl.prop || entries[1][0] !== decl.value))
          ) {
            const parent = decl.parent
            if (parent) {
              let last = decl
              for (const [prop, value] of entries) {
                const cloned = decl.clone({ prop, value })
                parent.insertAfter(last, cloned)
                last = cloned
              }
              decl.remove()
            }
          }
        }
      } catch (e) {}
    }
  }
}

plugin.postcss = true

export default plugin
