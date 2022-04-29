<template>
  <div
    v-resize:window="handleResize"
    class="FormNumberInput h-10 w-full flex bg-white border border-gray-300 rounded overflow-hidden select-none duration-150"
    :class="{
      'border-red-500': isError,
      'border-primary': input.isFocused
    }"
  >
    <div
      class="input-number-button border-r"
      :class="{
        'text-gray-300 cursor-not-allowed': isDisabled || isDisabledByMin
      }"
      @click="handleSubstract"
    >
      <BaseIcon class="font-semibold" size="w-3" name="subtract" />
    </div>

    <input
      ref="input"
      inputmode="numeric"
      class="h-full w-full py-2 px-4 text-center text-gray-700 text-sm font-medium leading-4 select-text"
      :class="{
        'bg-gray-100': isDisabled
      }"
      :disabled="isDisabled"
      :value="input.value"
      @focus="() => handleSetInputFocused(true)"
      @blur="handleBlur"
      @keyup="(event) => $emit('keyup', event)"
      @keyup.enter="handleKeyupEnter"
    />

    <div
      class="input-number-button border-l"
      :class="{
        'text-gray-300 cursor-not-allowed': isDisabled || isDisabledByMax
      }"
      @click="handleAdd"
    >
      <BaseIcon class="font-semibold" size="w-3" name="add" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseFormFormNumberInput',

  mixins: [require('@/mixins/breakpoints').default],

  props: {
    value: { type: Number, default: 0 },
    step: { type: Number, default: 1 },

    min: { type: Number, default: -Infinity },
    max: { type: Number, default: Infinity },

    isError: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    isFloatAllowed: { type: Boolean, default: false }
  },

  data: () => ({
    input: { value: '', isFocused: false }
  }),

  computed: {
    inputNumber() {
      return this.input.value.pUnmaskNumber()
    },

    isDisabledByMin() {
      return this.inputNumber <= this.min
    },
    isDisabledByMax() {
      return this.inputNumber >= this.max
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(value, oldValue) {
        if (value === oldValue) return

        value = this.defineNormalizedValue(value)
        this.handleInput(value)
      }
    }
  },

  methods: {
    handleInput(value) {
      if (this.$refs.input) {
        this.$refs.input.value = value
      }

      this.input.value = value
      this.$emit('input', this.inputNumber)
    },

    handleSetInputFocused(isFocused) {
      this.input.isFocused = isFocused

      isFocused ? this.$emit('focus') : this.$emit('blur')
    },

    handleSubstract() {
      if (this.isDisabled || this.isDisabledByMin) return

      let newValue = this.inputNumber - this.step
      newValue = this.defineNormalizedValue(newValue)

      this.handleInput(newValue)
    },
    handleAdd() {
      if (this.isDisabled || this.isDisabledByMax) return

      let newValue = this.inputNumber + this.step
      newValue = this.defineNormalizedValue(newValue)

      this.handleInput(newValue)
    },

    defineNormalizedValue(value) {
      value = value.toString()

      const formatteValue = (localValue) =>
        this.isFloatAllowed
          ? localValue.pToPositiveAndNegativeNumber()
          : localValue.pToPositiveAndNegativeInteger()

      let number = value.pUnmaskNumber()

      if (number > this.max) number = this.max
      if (number < this.min) number = this.min

      return formatteValue(number.toString())
    },

    handleBlur(event) {
      const value = this.defineNormalizedValue(event.target.value)

      this.handleInput(value)

      this.handleSetInputFocused(false)
    },

    handleKeyupEnter() {
      if (this.breakpoints.isMobile) return

      this.removeFocus()
    },

    removeFocus() {
      this.$refs.input && this.$refs.input.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
.input-number-button {
  @apply h-full w-10 flex items-center justify-center flex-shrink-0 text-gray-500 bg-gray-50 border-gray-300 select-none cursor-pointer duration-150 hover:text-primary;
}
</style>
