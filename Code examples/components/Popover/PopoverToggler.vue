<script>
export default {
  name: 'THBasePopoverPopoverToggler',

  props: {
    trigger: { type: Object, required: true },
    togglerId: { type: String, default: '' },
    isVisibleContent: { type: Boolean, default: false }
  },

  data: () => ({
    isMounted: false
  }),

  computed: {
    element() {
      if (!this.togglerId) return this.$el

      return this.isMounted ? document.getElementById(this.togglerId) : {}
    }
  },

  mounted() {
    this.isMounted = true

    this.addEventListeners()
  },

  beforeDestroy() {
    this.removeEventListeners()
  },

  methods: {
    handleOpen() {
      this.$emit('open')
    },
    handleForceClose() {
      this.$emit('close')
    },
    handleBeforeClose(event) {
      this.$emit('before-close', event)
    },

    handleClick() {
      return this.isVisibleContent ? this.handleForceClose() : this.handleOpen()
    },

    addEventListeners() {
      if (this.trigger.isHover) {
        this.element.addEventListener('mouseenter', this.handleOpen)
        this.element.addEventListener('mouseleave', this.handleBeforeClose)
      }

      setTimeout(() => {
        this.element.addEventListener('click', this.handleClick)
      })
    },
    removeEventListeners() {
      if (this.trigger.isHover) {
        this.element.removeEventListener('mouseenter', this.handleOpen)
        this.element.removeEventListener('mouseleave', this.handleBeforeClose)
      }

      this.element.removeEventListener('click', this.handleClick)
    }
  },

  render() {
    return this.$slots.default
  }
}
</script>
