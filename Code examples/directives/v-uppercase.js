export default {
  inserted(el, _, vnode) {
    el.__handler = (event) => {
      event.target.value = event.target.value.toUpperCase()
      vnode.componentInstance.$emit('input', event.target.value.toUpperCase())
    }

    el.addEventListener('input', el.__handler)
  },

  unbind(el) {
    el.removeEventListener('input', el.__handler)
  }
}
