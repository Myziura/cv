<template>
  <div
    v-resize:window="handleResize"
    class="FormInput flex bg-white overflow-hidden select-none duration-150"
    :class="{
      'h-10 border border-gray-300 rounded': !isNested,
      'pl-2': !normalized.prefix.isVisible,
      'border-red-500': input.isError,
      'bg-gray-100 cursor-not-allowed': isDisabled,
      'border-primary': input.isFocused
    }"
  >
    <div
      v-if="normalized.prefix.isVisible"
      class="h-full pl-2 flex items-center justify-center flex-shrink-0 text-gray-400 select-none"
      :class="{
        'cursor-not-allowed': isDisabled
      }"
    >
      <BaseIcon
        v-if="normalized.prefix.icon.isVisible"
        class="text-gray-300"
        :size="normalized.prefix.icon.size"
        :name="prefixIcon.name"
      />

      <slot v-else name="prefix" />
    </div>

    <!-- ref="input" -->
    <input
      v-only="onlyRules"
      v-mask="mask"
      v-autofocus="isAutofocus"
      class="h-full w-full p-2 flex placeholder-gray-300 text-sm font-medium leading-4 select-text bg-transparent"
      :class="[
        isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
      ]"
      v-bind="inputAttrs"
      :value="input.value"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup="(event) => $emit('keyup', event)"
      @keypress="(event) => $emit('keypress', event)"
      @change="(event) => handleChange(event.target.value)"
      @input="(event) => handleInput(event.target.value)"
    />

    <div
      v-if="normalized.isClearable"
      class="h-full px-2 flex items-center justify-center flex-shrink-0 text-gray-300 select-none cursor-pointer"
      :class="[
        'duration-150 hover:text-red-500',
        { 'opacity-0 pointer-events-none': !isValue }
      ]"
      @click="handleClear"
    >
      <BaseIcon size="w-2" name="close" />
    </div>

    <div
      v-if="isWordsLimit && isVisibleWordsLimit"
      class="h-full pr-2 flex items-center justify-center select-none"
      :class="[{ 'opacity-0 cursor-not-allowed': !isClickable }]"
    >
      <span class="text-xs text-gray-400 font-medium whitespace-nowrap">
        {{ wordsLimitText }}
      </span>
    </div>

    <div
      v-if="normalized.suffix.isVisible"
      class="h-full pr-2 flex items-center justify-center flex-shrink-0 font-medium text-gray-400 select-none"
      :class="{
        'cursor-not-allowed': isDisabled
      }"
    >
      <BaseIcon
        v-if="normalized.suffix.icon.isVisible"
        class="text-gray-300"
        :size="normalized.suffix.icon.size"
        :name="suffixIcon.name"
      />

      <slot v-else name="suffix" />
    </div>
  </div>
</template>

<script>
const ICON_INTERFACE = ['name', 'size']

const TYPES = Object.freeze({
  TEXT: 'text',
  EMAIL: 'email'
})

const INPUT_MODES = Object.freeze({
  TEXT: 'text',
  NUMERIC: 'numeric', // integer
  DECIMAL: 'decimal' // float
})

const ONLY_RULES = Object.freeze({
  [INPUT_MODES.TEXT]: [],
  [INPUT_MODES.NUMERIC]: ['number', 'escape'],
  [INPUT_MODES.DECIMAL]: ['number', 'dot', 'comma', 'escape']
})

export default {
  name: 'ThBaseFormFormInput',

  mixins: [require('@/mixins/breakpoints').default],

  props: {
    value: { type: [String, Number], default: '' },
    placeholder: { type: String, default: '' },

    wordsLimit: { type: Number, default: 0 },
    isVisibleWordsLimit: { type: Boolean, default: true },

    mask: { type: [String, Object], default: '' },
    type: {
      type: String,
      default: TYPES.TEXT,
      validator: (type) => Object.values(TYPES).includes(type)
    },
    inputmode: {
      type: String,
      default: INPUT_MODES.TEXT,
      validator: (mode) => Object.values(INPUT_MODES).includes(mode)
    },
    prefixIcon: {
      type: Object,
      default: () => ({}),
      validator: (value) =>
        Object.keys(value).every((key) => ICON_INTERFACE.includes(key))
    },
    suffixIcon: {
      type: Object,
      default: () => ({}),
      validator: (value) =>
        Object.keys(value).every((key) => ICON_INTERFACE.includes(key))
    },

    // isError: { type: Boolean, default: false },
    isNested: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    isClearable: { type: Boolean, default: false },
    isAutofocus: { type: Boolean, default: false },
    isDefaultOnlyRules: { type: Boolean, default: true }
  },

  data: () => ({
    input: { value: '', isFocused: false, isError: false },
    mutationObserver: {}
  }),

  computed: {
    isValue() {
      return Boolean(this.input.value)
    },

    isWordsLimit() {
      return this.wordsLimit > 0 && this.isClickable
    },
    wordsLimitText() {
      return `${this.input.value.length}/${this.wordsLimit}`.trim()
    },

    isClickable() {
      return !this.isDisabled
    },

    onlyRules() {
      return this.isDefaultOnlyRules ? ONLY_RULES[this.inputmode] || [] : []
    },

    normalized() {
      const isNumeric = this.inputmode === INPUT_MODES.NUMERIC
      const isDecimal = this.inputmode === INPUT_MODES.DECIMAL

      const definePlaceholder = () => {
        if (this.placeholder) return this.placeholder

        return isNumeric ? '0' : ''
      }
      const placeholder = definePlaceholder()

      const isPrefixIcon = Boolean(this.prefixIcon.name)
      const isSuffixIcon = Boolean(this.suffixIcon.name)

      return {
        placeholder,

        inputmode: { isNumeric, isDecimal },

        prefix: {
          isVisible: isPrefixIcon || this.$slots.prefix,
          icon: {
            isVisible: isPrefixIcon,
            size: this.prefixIcon.size || 'w-4'
          }
        },
        suffix: {
          isVisible: isSuffixIcon || this.$slots.suffix,
          icon: {
            isVisible: isSuffixIcon,
            size: this.suffixIcon.size || 'w-4'
          }
        },

        isClearable: this.isClearable && this.isClickable
      }
    },

    inputAttrs() {
      return {
        type: this.type,
        inputmode: this.inputmode,
        placeholder: this.normalized.placeholder,
        disabled: this.isDisabled,
        ...(this.isWordsLimit ? { maxlength: `${this.wordsLimit}` } : {})
      }
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(value, oldValue) {
        if (value === oldValue) return

        this.setInputValue(value)
      }
    }
  },

  mounted() {
    const isParentFormField = [...this.$parent.$el.classList].includes(
      'FormField'
    )

    if (!isParentFormField) return

    const callback = (mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          this.input.isError = [...this.$parent.$el.classList].includes(
            'is-error'
          )
        }
      })
    }

    this.mutationObserver = new MutationObserver(callback)

    this.mutationObserver.observe(this.$parent.$el, { attributes: true })
  },

  beforeDestoy() {
    if (this.mutationObserver) this.mutationObserver.disconnect()
  },

  methods: {
    setInputValue(value) {
      if (this.input.value === value) return

      const { isDecimal } = this.normalized.inputmode

      // if (isNumeric) value = `${value}`.pMaskThousand()
      // if (isDecimal) value = `${value}`.replace(',', '.')
      if (isDecimal) value = `${value}`.pMaskDecimalNumeral()

      // if (this.$refs.input) this.$refs.input.value = value
      this.input.value = value
    },

    handleInput(value) {
      this.setInputValue(value)
      this.$emit('input', this.input.value)
    },

    handleChange(value) {
      this.setInputValue(value)
      this.$emit('change', this.input.value)
    },

    handleClear() {
      this.handleInput('')
      this.$emit('clear')
    },

    handleSetInputFocused(isFocused) {
      if (!this.isClickable) return

      this.input.isFocused = isFocused
    },

    handleFocus(event) {
      this.handleSetInputFocused(true)
      this.$emit('focus', event)
    },

    handleBlur(event) {
      this.handleSetInputFocused(false)
      this.$emit('blur', event)
    }
  }
}
</script>
