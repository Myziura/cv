import Vue from 'vue'

export default {
  inserted(el, binding) {
    const callback = binding.value
    const isWindow = binding.arg === 'window'

    el.__handler = () => {
      const x = isWindow ? window.innerWidth : el.offsetWidth
      const y = isWindow ? window.innerHeight : el.offsetHeight

      if (isWindow) {
        Vue.prototype.windowSize = { x, y }
      }

      callback({ x, y })
    }

    window.addEventListener('resize', el.__handler)

    el.__handler()
  },

  unbind(el) {
    window.removeEventListener('resize', el.__handler)
  }
}
