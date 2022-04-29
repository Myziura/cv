<template>
  <component :is="tag" v-resize:window="handleResize">
    <!-- inline-flex -->
    <!-- <div class="relative"> -->
    <Toggler
      ref="toggler"
      :trigger="normalizedTrigger"
      :toggler-id="togglerId"
      :is-visible-content="isVisibleContent"
      @open="handleOpenContent"
      @close="handleForceClose"
      @before-close="handleBeforeCloseContent"
    >
      <slot :is-visible-content="isVisibleContent" name="toggler" />
    </Toggler>

    <Content
      v-if="isVisibleContent"
      ref="content"
      :trigger="normalizedTrigger"
      :default-placement="placement"
      :content-class="contentClass"
      :content-style="contentStyle"
      :toggler-boundaries="togglerBoundaries"
      :is-content-width-as-toggler="isContentWidthAsToggler"
      :before-close="handleBeforeCloseContent"
      :transition-name="transitionName"
      :z-index="zIndex"
      @close="handleCloseContent"
    >
      <slot name="content" />
    </Content>
    <!-- </div> -->
  </component>
</template>

<script>
import Toggler from '@/components/Base/Popover/PopoverToggler'
const Content = () => import('@/components/Base/Popover/PopoverContent')

const TRIGGER_TYPES = Object.freeze({
  HOVER: 'hover',
  CLICK: 'click'
})

const defineIsPointInRect = ({ x1, y1, x2, y2 }, { x, y }) =>
  x > x1 && x < x2 && y > y1 && y < y2

export default {
  name: 'THBasePopoverPopover',

  components: { Toggler, Content },

  props: {
    tag: { type: String, default: 'div' },
    trigger: {
      type: String,
      default: TRIGGER_TYPES.HOVER,
      validator: (trigger) => Object.values(TRIGGER_TYPES).includes(trigger)
    },
    placement: { type: String, default: undefined },
    contentClass: { type: [String, Object, Array], default: '' },
    contentStyle: { type: Object, default: () => ({}) },
    togglerId: { type: String, default: '' },
    isContentVisibleOnCreate: { type: Boolean, default: false },
    isContentWidthAsToggler: { type: Boolean, default: false },
    togglerKey: { type: Number, default: 0 },
    isDisabled: { type: Boolean, default: false },
    transitionName: { type: String, default: undefined },
    zIndex: { type: [String, Number], default: 2005 }
  },

  data: () => ({
    isVisibleContent: false,
    togglerBoundaries: {},
    scrollableParents: []
  }),

  computed: {
    normalizedTrigger() {
      return {
        isHover: this.trigger === TRIGGER_TYPES.HOVER,
        isClick: this.trigger === TRIGGER_TYPES.CLICK
      }
    }
  },

  watch: {
    togglerKey: {
      handler: 'updateTogglerBoundaries'
    }
  },

  created() {
    if (!this.togglerId) return

    this.$root.$on(`activate-${this.togglerId}`, this.handleOpenContent)
  },

  mounted() {
    if (this.isContentVisibleOnCreate) {
      this.handleOpenContent()
    }

    this.defineScrollableParentsListeners()
  },

  beforeDestroy() {
    if (!this.togglerId) return

    this.$root.$off(`activate-${this.togglerId}`, this.handleOpenContent)

    this.scrollableParents.forEach((scrollable) => {
      scrollable.removeEventListener(
        'scroll',
        this.calculateSmartPopoverPosition
      )
    })
  },

  methods: {
    handleOpenContent() {
      if (this.isDisabled) return

      this.updateTogglerBoundaries()
      this.isVisibleContent = true
    },

    handleBeforeCloseContent(event) {
      if (!this.isVisibleContent) return

      try {
        const { clientX: x, clientY: y } = event

        const togglerBoundaries = this.defineTogglerBoundaries()
        const contentBoundaries = this.defineContentBoundaries()

        const isMouseInToggler = defineIsPointInRect(
          {
            x1: Math.floor(togglerBoundaries.left),
            y1: Math.floor(togglerBoundaries.top),
            x2: Math.floor(togglerBoundaries.right),
            y2: Math.floor(togglerBoundaries.bottom)
          },
          { x, y }
        )
        const isMouseInContent = defineIsPointInRect(
          {
            x1: Math.floor(contentBoundaries.left),
            y1: Math.floor(contentBoundaries.top),
            x2: Math.floor(contentBoundaries.right),
            y2: Math.floor(contentBoundaries.bottom)
          },
          { x, y }
        )

        if (isMouseInToggler || isMouseInContent) return

        this.handleForceClose()
      } catch {}
    },
    handleCloseContent() {
      this.isVisibleContent = false
      this.$emit('close')
    },
    handleForceClose() {
      if (!this.$refs.content) return

      this.$refs.content.handleClose()
    },

    defineTogglerBoundaries() {
      if (!this.$refs.toggler) return

      const boundaries = this.$refs.toggler.element.getBoundingClientRect()

      return JSON.parse(JSON.stringify(boundaries))
    },
    defineContentBoundaries() {
      const boundaries = this.$refs.content.$el.getBoundingClientRect()

      return JSON.parse(JSON.stringify(boundaries))
    },

    defineScrollableParentsListeners() {
      this.scrollableParents = [document]
      let element = this.$el

      while (element && element.id !== '__layout') {
        if (element.scrollHeight > element.clientHeight) {
          this.scrollableParents.push(element)
        }
        element = element.parentElement
      }

      this.scrollableParents.forEach((scrollable) => {
        scrollable.addEventListener('scroll', this.updateTogglerBoundaries)
      })
    },

    handleResize() {
      if (this.$refs.toggler.element) {
        this.updateTogglerBoundaries()
      }
    },

    updateTogglerBoundaries() {
      this.togglerBoundaries = this.defineTogglerBoundaries()
    }
  }
}
</script>
