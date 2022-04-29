<template>
  <div
    v-resize:window="handleResize"
    class="FormInput flex flex-col bg-white border border-gray-300 rounded select-none duration-150"
    :class="{
      relative: normalized.isAutosize,
      'border-red-500': isError,
      'bg-gray-100 cursor-not-allowed': isDisabled,
      'border-primary': input.isFocused
    }"
  >
    <textarea
      ref="textarea"
      v-autofocus="isAutofocus"
      class="w-full flex p-2 placeholder-gray-300 text-sm font-medium leading-4 select-text bg-transparent appearance-none"
      :class="[
        normalized.isAutosize ? 'overflow-hidden' : 'overflow-y-auto',
        isDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-700'
      ]"
      :style="textareaStyle"
      v-bind="textareaAttrs"
      :value="input.value"
      @focus="() => handleSetInputFocused(true)"
      @blur="() => handleSetInputFocused(false)"
      @change="(event) => handleChange(event.target.value)"
      @input="(event) => handleInput(event.target.value)"
    />

    <div class="w-full p-2 pt-0 flex items-center justify-end leading-none">
      <div
        v-if="normalized.isClearable"
        class="h-full mr-2 flex items-center justify-center flex-shrink-0 rounded-full text-gray-300 select-none cursor-pointer"
        :class="[
          'duration-150 hover:text-red-500',
          { 'opacity-0 pointer-events-none': !isValue }
        ]"
        @click="handleClear"
      >
        <BaseIcon size="w-2" name="close" />
      </div>

      <div
        v-if="isWordsLimit"
        class="h-full flex items-center justify-center rounded select-none"
        :class="[{ 'opacity-0 cursor-not-allowed': !isClickable }]"
      >
        <span
          class="text-xs text-gray-400 font-medium whitespace-nowrap leading-none"
        >
          {{ wordsLimitText }}
        </span>
      </div>
    </div>

    <div
      v-if="normalized.isAutosize"
      class="absolute top-0 left-0 w-full p-2 flex invisible opacity-0 pointer-events-none overflow-hidden"
    >
      <span
        ref="textarea-text"
        class="text-sm font-medium leading-4 break-all whitespace-pre-line"
        style="min-height: 1rem"
      >
        <span>{{ checkValue }}</span>
      </span>
    </div>
  </div>
</template>

<script>
const LINE_HEIGHT = 16
// const RESIZE = Object.freeze({
//   NONE: 'none',
//   // BOTH: 'both',
//   // HORIZONTAL: 'horizontal',
//   // VERTICAL: 'vertical'
// })

export default {
  name: 'ThBaseFormFormInput',

  mixins: [require('@/mixins/breakpoints').default],

  props: {
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    wordsLimit: { type: Number, default: 0 },

    rows: { type: Number, default: 3, validator: (rows) => rows >= 3 },
    autosize: { type: Object, default: () => ({}) },

    // resize: {
    //   type: String,
    //   default: RESIZE.NONE,
    //   validator: (resize) => Object.values(RESIZE).includes(resize)
    // },

    isError: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    isClearable: { type: Boolean, default: false },
    isAutofocus: { type: Boolean, default: false }
  },

  data: () => ({
    input: { value: '', isFocused: false },
    checkValue: ''
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

    normalized() {
      const { minRows } = this.autosize

      return {
        minHeight: `${(minRows || this.rows) + 2}rem`,
        isAutosize: Boolean(minRows),
        isClearable: this.isClearable && this.isClickable
      }
    },

    textareaAttrs() {
      return {
        placeholder: this.placeholder,
        disabled: this.isDisabled,
        ...(this.isWordsLimit ? { maxlength: `${this.wordsLimit}` } : {})
      }
    },

    textareaStyle() {
      const minHeight = this.normalized.isAutosize
        ? this.normalized.minHeight
        : `${this.rows + 2}rem`

      return {
        resize: 'none',
        rows: this.rows || '',
        'min-height': minHeight
      }
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(value, oldValue) {
        if (value === oldValue) return

        this.setInputValueAndHeight(value)
      }
    }
  },

  methods: {
    setInputValueAndHeight(value) {
      this.setInputValue(value)
      this.setInputHeight(value)
    },

    setInputValue(value) {
      if (this.input.value === value) return

      this.input.value = value

      if (!this.$refs.textarea) return

      this.$refs.textarea.value = value
    },

    async setInputHeight(value) {
      // if (this.input.value === value) return
      if (!this.normalized.isAutosize) return

      await this.$nextTick()

      if (!this.$refs.textarea) return

      this.$refs.textarea.style.height = 'auto'

      if (!value) {
        this.$refs.textarea.style.height = this.normalized.minHeight
        return
      }

      this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`
    },

    async handleInput(value) {
      const isFits = await this.beforeSetInputValue(value)

      if (!isFits) return

      this.setInputValueAndHeight(value)
      this.$emit('input', this.input.value)
    },

    async handleChange(value) {
      const isFits = await this.beforeSetInputValue(value)

      if (!isFits) return

      this.setInputValueAndHeight(value)
      this.$emit('change', this.input.value)
    },

    handleClear() {
      this.handleInput('')
      this.$emit('clear')
    },

    async beforeSetInputValue(value) {
      if (!this.normalized.isAutosize) return true

      const isFits = await this.defineIsValueFits(value)

      if (isFits) return true

      if (this.$refs.textarea) this.$refs.textarea.value = this.input.value

      return false
    },

    async defineIsValueFits(value) {
      this.checkValue = value

      const additionalLines = value.split(/\r?\n/).pop() === '' ? 1 : 0

      await this.$nextTick()

      if (!this.$refs['textarea-text']) return true

      const lines =
        this.$refs['textarea-text'].clientHeight / LINE_HEIGHT + additionalLines
      const isFits = lines <= this.autosize.maxRows

      return isFits
    },

    handleSetInputFocused(isFocused) {
      if (!this.isClickable) return

      this.input.isFocused = isFocused
    }
  }
}
</script>
