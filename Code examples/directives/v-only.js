import { RULES } from '@/utils/regExpRules'

export default {
  inserted(el, binding) {
    const rulesNames = binding.value || Object.keys(binding.modifiers)
    const isValue = Boolean(rulesNames.length)

    if (!isValue) return

    const defineRule = (rulesString) => new RegExp(`^[${rulesString}]+$`, 'gi')

    const rules = rulesNames.map((name) => RULES[name])
    const rulesString = rules.join('')
    const rule = defineRule(rulesString)

    el.__handler = (event) => {
      let value

      if (event.type === 'keypress') {
        value = event.key
      } else if (event.type === 'paste') {
        value = event.clipboardData.getData('text/plain').toString()
      }

      const isValid = Boolean(value.match(rule))

      if (!isValid) event.preventDefault()
    }

    el.addEventListener('keypress', el.__handler)
    el.addEventListener('paste', el.__handler)
  },

  unbind(el) {
    el.removeEventListener('keypress', el.__handler)
    el.removeEventListener('paste', el.__handler)
  }
}
