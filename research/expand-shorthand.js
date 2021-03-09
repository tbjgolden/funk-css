const {
  isShorthandProperty,
  expandShorthandProperty
} = require('css-property-parser');

const parseTransition = require('./parse-transition');

module.exports = () => {
  return {
    postcssPlugin: 'postcss-shorthand-expand',
    Rule: (rule) => {
      rule.walkDecls((declaration) => {
        if (isShorthandProperty(declaration.prop)) {
          try {
            var expandedDecls = expandShorthandProperty(declaration.prop, declaration.value)

            Object.keys(expandedDecls).forEach(function (prop) {
              rule.insertBefore(declaration, { prop, value: expandedDecls[prop] })
            })

            declaration.remove()
          } catch (e) {
            const { prop, value } = declaration

            let hasMutated = true;
            const newDecls = {}
            if ((prop === "border-top" || prop === "border-bottom" || prop === "border-left" || prop === "border-right") && value.includes(" solid ")) {
              const [width, color] = value.split(" solid ")
              newDecls[`${prop}-width`] = width.trim() ?? "medium"
              newDecls[`${prop}-style`] = "solid"
              newDecls[`${prop}-color`] = color.trim() ?? "currentcolor"
            } else if (prop === "border-color") {
              newDecls[`border-top-color`] = value
              newDecls[`border-left-color`] = value
              newDecls[`border-right-color`] = value
              newDecls[`border-bottom-color`] = value
            } else if (prop === "transition") {
              const transitions = parseTransition(value)
              const delays = new Set(transitions.map(({ delay }) => delay ?? 0))
              const durations = new Set(transitions.map(({ duration }) => duration ?? 0))
              const timingFunctions = new Set(transitions.map(({ timingFunction }) => timingFunction ?? 'ease'))
              if (delays.size === 1 && durations.size === 1 && timingFunctions.size === 1) {
                const property = transitions.map(({ name }) => name).join(", ")
                const delay = ([...delays.values()])[0]
                const duration = ([...durations.values()])[0]
                const timingFunction = ([...timingFunctions.values()])[0]
                newDecls[`transition-property`] = property
                newDecls[`transition-delay`] = `${delay}ms`
                newDecls[`transition-duration`] = `${duration}ms`
                newDecls[`transition-timing-function`] = timingFunction
              } else {
                hasMutated = false
              }
            } else {
              hasMutated = false
            }

            if (hasMutated) {
              Object.keys(newDecls).forEach(function (prop) {
                rule.insertBefore(declaration, { prop, value: newDecls[prop] })
              })
              declaration.remove()
            }
            /*
            "background"
            ​"transition"
            ​"border-radius"
            ​"padding"
            ​"border-top"
            ​"margin"
            ​"border-color"
            ​"border-bottom"
            ​"border-left"
            ​"outline"
            ​"grid-column"
            ​"grid-row"
            */

            // console.log(`postcss-shorthand-expand failed to expand a property ${declaration.prop}: ${declaration.value};`)
          }
        }
      })
    }
  }
}

module.exports.postcss = true
