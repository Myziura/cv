<!-- NOTE use only via utils "@/utils/notify" -->

<template>
  <transition name="slide-left" appear>
    <div
      v-if="isVisible"
      ref="notification"
      class="fixed right-0 w-full px-4 duration-300"
      :style="`max-width: 400px; z-index: 9000; top: ${verticalOffset}px`"
    >
      <div
        class="w-full flex justify-between bg-white border rounded-lg shadow"
      >
        <div class="w-full p-4 flex items-start justify-start">
          <BaseIcon
            class="mr-4"
            :name="notification.icon"
            :color="notification.color"
            size="extra-large"
          />

          <div class="flex flex-col">
            <h6 class="text-black font-medium">{{ notification.title }}</h6>
            <span
              v-if="notification.text"
              class="text-gray-600"
              style="hyphens: auto"
            >
              {{ notification.text }}
            </span>
          </div>
        </div>

        <div
          class="flex flex-initial flex-col text-center border-l cursor-pointer select-none"
        >
          <div
            v-for="(button, index) of normalizedButtons"
            :key="`notification-${_uid}-button-${index}`"
            class="h-full px-4 py-2 flex items-center justify-center text-gray-600 hover:text-primary"
            :class="{ 'border-t': index >= 1 }"
            @click="handleButtonClick(button.handler)"
          >
            <span class="font-medium">{{ button.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import config from '@/config/general'

const TYPES = Object.freeze({
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
})

export default {
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => Object.values(TYPES).includes(value)
    },
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    isInfinite: { type: Boolean, default: false },
    buttons: { type: Array, default: () => [] },
    duration: {
      type: Number,
      default: config.ui.messages.duration,
      validator: (value) => value >= 1000
    }
  },

  data: () => ({
    isVisible: true,
    verticalOffset: 0
  }),

  computed: {
    normalizedText() {
      let text, href
      const isUrlInside = this.text.pIsUrlInside()

      if (isUrlInside) {
        href = this.text.pParseUrl()
        text = this.text.split(href)[0].trim()
      } else {
        text = this.text
      }

      return text
    },
    normalizedLink() {
      const isUrlInside = this.text.pIsUrlInside()

      if (!isUrlInside) return {}

      const href = this.text.pParseUrl()
      const text = this.text.split(href)[1].trim() || href

      return { href, text }
    },

    notification() {
      const types = {
        [TYPES.SUCCESS]: {
          // eslint-disable-next-line no-undef
          title: this.title || `${$nuxt.$t(`messages.success`)}!`,
          text: this.normalizedText,
          icon: 'check-circle',
          color: 'text-green-500'
        },
        [TYPES.WARNING]: {
          // eslint-disable-next-line no-undef
          title: this.title || `${$nuxt.$t(`messages.warning`)}!`,
          text: this.normalizedText,
          icon: 'alert-triangle',
          color: 'text-yellow-500'
        },
        [TYPES.ERROR]: {
          // eslint-disable-next-line no-undef
          title: this.title || `${$nuxt.$t(`messages.error`)}!`,
          text: this.normalizedText,
          icon: 'remove-circle',
          color: 'text-red-500'
        },
        [TYPES.INFO]: {
          // eslint-disable-next-line no-undef
          title: this.title || $nuxt.$t(`messages.information`),
          text: this.normalizedText,
          icon: 'information-circle',
          color: 'text-gray-500'
        }
      }

      return types[this.type]
    },

    normalizedButtons() {
      return [
        {
          // eslint-disable-next-line no-undef
          text: $nuxt.$t(`forms.common.close`),
          handler: () => {}
        },
        this.normalizedLink.text && {
          text: this.normalizedLink.text,
          handler: () => window.open(this.normalizedLink.href, '_blank')
        },
        ...this.buttons
      ].filter(Boolean)
    }
  },

  mounted() {
    if (this.isInfinite) return

    setTimeout(this.handleClose, this.duration)
  },

  methods: {
    handleClose() {
      this.onClose(this._uid)

      setTimeout(() => (this.isVisible = false))
    },

    handleButtonClick(handler) {
      handler()
      this.handleClose()
    }
  }
}
</script>
