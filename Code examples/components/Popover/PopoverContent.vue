<template>
  <ul>
    <li
      ref="content"
      class="fixed top-0 left-0 flex p-4"
      :style="`z-index: ${zIndex}`"
    >
      <transition :name="normalizedTransitionName" appear>
        <!-- opacity-0 pointer-events-none -->
        <div
          v-if="isVisible"
          class="flex z-10"
          :class="normalizedContentClass"
          :style="normalizedContentStyle"
        >
          <slot />
        </div>
      </transition>
    </li>

    <li
      v-for="(popover, index) of system.popoversList"
      :ref="`popover-test-${popover.placement}`"
      :key="`popover-test-${popover.placement}-${index}`"
      class="fixed top-0 left-0 p-4 pointer-events-none opacity-0 invisible"
    />
    <!-- :class="`${popover.placement}`" -->
    <!-- pointer-events-none opacity-0 invisible -->
    <!-- <div
        class="h-full w-full bg-opacity-25 border"
        :class="[
          popover.isFits
            ? 'text-blue-500 bg-blue-100 border-blue-500'
            : 'text-red-500 bg-red-100 border-red-500 border-dashed'
        ]"
      >
        {{ popover.placement }}
      </div>
    </li> -->
  </ul>
</template>

<script>
const BASE_MARGIN = 16

const PLACEMENTS = Object.freeze({
  TOP_START: 'top-start',
  TOP_END: 'top-end',
  TOP: 'top',

  BOTTOM_START: 'bottom-start',
  BOTTOM_END: 'bottom-end',
  BOTTOM: 'bottom',

  LEFT_START: 'left-start',
  LEFT_END: 'left-end',
  LEFT: 'left',

  RIGHT_START: 'right-start',
  RIGHT_END: 'right-end',
  RIGHT: 'right'
})

const TRANSITIONS = Object.freeze({
  FADE: 'fade',

  TOP: 'el-zoom-in-bottom',
  BOTTOM: 'el-zoom-in-top',
  LEFT: 'el-zoom-in-right',
  RIGHT: 'el-zoom-in-left'
})

export default {
  name: 'THBasePopoverPopoverContent',

  mixins: [require('@/mixins/append-to-body').default],

  props: {
    trigger: { type: Object, required: true },
    defaultPlacement: {
      type: String,
      default: PLACEMENTS.BOTTOM,
      validator: (value) => Object.values(PLACEMENTS).includes(value)
    },
    togglerBoundaries: { type: Object, required: true },
    isContentWidthAsToggler: { type: Boolean, default: false },
    contentClass: { type: [String, Object, Array], default: '' },
    contentStyle: { type: Object, default: () => ({}) },
    beforeClose: { type: Function, default: () => true },
    transitionName: {
      type: String,
      default: TRANSITIONS.BOTTOM,
      validator: (value) => Object.values(TRANSITIONS).includes(value)
    },
    zIndex: { type: [Number, String], default: 2005 }
  },

  data: () => ({
    isVisible: true,
    activePlacement: '',
    normalizedTransitionName: '',

    system: {
      popoversList: [],
      intersectionObservers: {},
      resizeObserver: null
    }
  }),

  computed: {
    normalizedContentClass() {
      const defaultClass = 'bg-white rounded-md shadow-light-all-sides'

      return this.contentClass || defaultClass
    },

    normalizedContentStyle() {
      return this.isContentWidthAsToggler
        ? { width: `${this.togglerBoundaries.width}px`, ...this.contentStyle }
        : this.contentStyle
    }
  },

  watch: {
    togglerBoundaries: {
      handler: 'calculateSmartPopoverPosition'
    }
  },

  async mounted() {
    await this.calculateSmartPopoverPosition()

    await this.$nextTick()

    this.addEventListeners()
  },

  beforeDestroy() {
    this.removeEventListeners()

    this.isVisible = false
  },

  methods: {
    defineNormalizedPlacement(placement) {
      return {
        isTop: placement === PLACEMENTS.TOP,
        isTopStart: placement === PLACEMENTS.TOP_START,
        isTopEnd: placement === PLACEMENTS.TOP_END,

        isBottom: placement === PLACEMENTS.BOTTOM,
        isBottomStart: placement === PLACEMENTS.BOTTOM_START,
        isBottomEnd: placement === PLACEMENTS.BOTTOM_END,

        isLeft: placement === PLACEMENTS.LEFT,
        isLeftStart: placement === PLACEMENTS.LEFT_START,
        isLeftEnd: placement === PLACEMENTS.LEFT_END,

        isRight: placement === PLACEMENTS.RIGHT,
        isRightStart: placement === PLACEMENTS.RIGHT_START,
        isRightEnd: placement === PLACEMENTS.RIGHT_END
      }
    },

    defineIsPlacementIn(placement) {
      const normalizedPlacement = this.defineNormalizedPlacement(placement)

      const { isTop, isTopStart, isTopEnd } = normalizedPlacement
      const isTopFamily = isTop || isTopStart || isTopEnd

      const { isBottom, isBottomStart, isBottomEnd } = normalizedPlacement
      const isBottomFamily = isBottom || isBottomStart || isBottomEnd

      const { isLeft, isLeftStart, isLeftEnd } = normalizedPlacement
      const isLeftFamily = isLeft || isLeftStart || isLeftEnd

      const { isRight, isRightStart, isRightEnd } = normalizedPlacement
      const isRightFamily = isRight || isRightStart || isRightEnd

      return {
        topFamily: isTopFamily,
        bottomFamily: isBottomFamily,
        verticalFamily: isTopFamily || isBottomFamily,

        leftFamily: isLeftFamily,
        rightFamily: isRightFamily,
        horizontalFamily: isLeftFamily || isRightFamily
      }
    },

    async calculateSmartPopoverPosition() {
      const {
        clientHeight: windowHeight,
        clientWidth: windowWidth
      } = document.documentElement

      const placements = Object.values(PLACEMENTS)
      this.system.popoversList = placements.map((placement) => ({ placement }))

      await this.$nextTick()

      if (!this.$refs.content) return

      const content = this.defineContentBoundaries()

      this.system.popoversList.forEach(({ placement }) => {
        const position = this.definePopoverPositionByPlacement(placement)

        const el = this.$refs[`popover-test-${placement}`][0]

        el.style.height = `${content.height + BASE_MARGIN * 2}px`
        el.style.width = `${content.width + BASE_MARGIN * 2}px`

        this.setElementPosition(el, position)
      })

      await this.$nextTick()

      this.system.popoversList = this.system.popoversList.map(
        ({ placement }) => {
          const el = this.$refs[`popover-test-${placement}`][0]

          const elBoundaries = el.getBoundingClientRect()

          let isFits = {
            byHeight:
              elBoundaries.top >= 0 && elBoundaries.bottom <= windowHeight,
            byWidth: elBoundaries.left >= 0 && elBoundaries.right <= windowWidth
          }

          isFits = isFits.byHeight && isFits.byWidth

          return { placement, isFits }
        }
      )

      const popoversFitsList = this.system.popoversList.filter(
        (popover) => popover.isFits
      )

      const placementsFitsList = popoversFitsList.map(
        (popover) => popover.placement
      )

      this.setPopoverPlacementByFitsList(placementsFitsList)
    },

    setPopoverPlacementByFitsList(placementsFitsList) {
      const setPopover = async (placement) => {
        if (this.activePlacement !== placement) {
          this.isVisible = false
        }

        this.defineTransitionByPlacement(placement)

        await this.$nextTick()

        this.isVisible = true

        const position = this.definePopoverPositionByPlacement(placement)
        this.setElementPosition(this.$refs.content, position)

        this.activePlacement = placement
      }

      const isDefaultPlacementIncludesFitsList = placementsFitsList.includes(
        this.defaultPlacement
      )

      if (isDefaultPlacementIncludesFitsList) {
        return setPopover(this.defaultPlacement)
      }

      const defaultPlacementRoot = this.defaultPlacement.split('-')[0]
      const similarPlacement = placementsFitsList.find((placement) =>
        placement.includes(defaultPlacementRoot)
      )

      if (similarPlacement) {
        return setPopover(similarPlacement)
      }

      const placement = placementsFitsList.length
        ? placementsFitsList[0]
        : this.activePlacement || this.defaultPlacement

      setPopover(placement)
    },

    definePopoverPositionByPlacement(placement) {
      const position = {}
      const toggler = { ...this.togglerBoundaries }
      const content = this.defineContentBoundaries()

      const isPlacementIn = this.defineIsPlacementIn(placement)
      const normalizedPlacement = this.defineNormalizedPlacement(placement)

      if (isPlacementIn.topFamily) {
        position.y = toggler.top - content.height - BASE_MARGIN * 2
      }
      if (normalizedPlacement.isTopStart) {
        position.x = toggler.left - BASE_MARGIN
      }
      if (normalizedPlacement.isTopEnd) {
        position.x = toggler.right - content.width - BASE_MARGIN
      }

      if (isPlacementIn.bottomFamily) {
        position.y = toggler.bottom
      }
      if (normalizedPlacement.isBottomStart) {
        position.x = toggler.left - BASE_MARGIN
      }
      if (normalizedPlacement.isBottomEnd) {
        position.x = toggler.right - content.width - BASE_MARGIN
      }

      if (isPlacementIn.leftFamily) {
        position.x = toggler.left - content.width - BASE_MARGIN * 2
      }
      if (normalizedPlacement.isLeftStart) {
        position.y = toggler.top - BASE_MARGIN
      }
      if (normalizedPlacement.isLeftEnd) {
        position.y = toggler.bottom - content.height - BASE_MARGIN
      }

      if (isPlacementIn.rightFamily) {
        position.x = toggler.right
      }
      if (normalizedPlacement.isRightStart) {
        position.y = toggler.top - BASE_MARGIN
      }
      if (normalizedPlacement.isRightEnd) {
        position.y = toggler.bottom - content.height - BASE_MARGIN
      }

      if (normalizedPlacement.isTop || normalizedPlacement.isBottom) {
        const x =
          toggler.left + toggler.width / 2 - content.width / 2 - BASE_MARGIN

        position.x = x
      }
      if (normalizedPlacement.isLeft || normalizedPlacement.isRight) {
        const y =
          toggler.top + toggler.height / 2 - content.height / 2 - BASE_MARGIN

        position.y = y
      }

      return position
    },

    setElementPosition(el, { x, y }) {
      el.style.transform = `translate(${parseInt(x)}px, ${parseInt(y)}px)`
    },

    defineContentBoundaries() {
      const boundaries = this.$refs.content.getBoundingClientRect()

      return {
        // top: boundaries.top + BASE_MARGIN,
        // right: boundaries.right - BASE_MARGIN,
        // left: boundaries.left + BASE_MARGIN,
        // bottom: boundaries.bottom - BASE_MARGIN,
        height: boundaries.height - BASE_MARGIN * 2,
        width: boundaries.width - BASE_MARGIN * 2
      }
    },

    defineTransitionByPlacement(placement) {
      const defineTransitionName = () => {
        if (this.transitionName === TRANSITIONS.FADE) return TRANSITIONS.FADE

        const isPlacementIn = this.defineIsPlacementIn(placement)

        if (isPlacementIn.topFamily) return TRANSITIONS.TOP
        if (isPlacementIn.bottomFamily) return TRANSITIONS.BOTTOM
        if (isPlacementIn.leftFamily) return TRANSITIONS.LEFT
        if (isPlacementIn.rightFamily) return TRANSITIONS.RIGHT
      }

      this.normalizedTransitionName = defineTransitionName()
    },

    addEventListeners() {
      if (!this.$refs.content) return

      if (this.trigger.isHover) {
        this.$refs.content.addEventListener('mouseleave', this.beforeClose)
      }

      if (this.trigger.isClick) {
        setTimeout(() => {
          document.body.addEventListener('click', this.handleClick)
        })
      }

      this.system.resizeObserver = new ResizeObserver(() => {
        if (!this.isVisible) return
        this.calculateSmartPopoverPosition()
      })
      this.system.resizeObserver.observe(this.$refs.content)

      Object.values(PLACEMENTS).forEach((placement) => {
        const el = this.$refs[`popover-test-${placement}`][0]

        this.system.intersectionObservers[placement] = new IntersectionObserver(
          (entries) => {
            entries.forEach(this.calculateSmartPopoverPosition)
          },
          { threshold: [0, 1] }
        )

        this.system.intersectionObservers[placement].observe(el)
      })
    },

    removeEventListeners() {
      if (!this.$refs.content) return

      if (this.trigger.isHover) {
        this.$refs.content.removeEventListener('mouseleave', this.beforeClose)
      }

      if (this.trigger.isClick) {
        document.body.removeEventListener('click', this.handleClick)
      }

      if (this.system.resizeObserver) {
        this.system.resizeObserver.unobserve(this.$refs.content)
      }

      Object.values(PLACEMENTS).forEach((placement) => {
        const el = this.$refs[`popover-test-${placement}`][0]
        const observer = this.system.intersectionObservers[placement]

        if (observer) observer.unobserve(el)
      })
    },

    handleClick(event) {
      const isClickOutside = !this.$refs.content.contains(event.target)

      if (isClickOutside) {
        this.beforeClose(event)
      }
    },

    handleClose() {
      this.isVisible = false
      setTimeout(() => this.$emit('close'), 300)
    }
  }
}
</script>
