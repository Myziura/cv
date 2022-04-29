<template>
  <div
    class="flex text-gray-700 cursor-pointer select-none"
    :class="{
      'h-10': sizes.isMedium,
      'h-8': sizes.isSmall
    }"
  >
    <div
      v-for="(radio, index) of list"
      :key="`radio-yoda-${radio.value}`"
      :ref="`radio-${index}`"
      class="flex justify-center items-center text-center text-sm font-medium leading-4 border border-gray-300 duration-150"
      :class="[
        {
          'px-4 py-2 bg-white overflow-hidden': isBasic,
          'text-gray-300 border-gray-300 cursor-not-allowed': isDisabled,
          'text-white bg-primary border-primary':
            defineIsActive(radio) && !isDisabled,
          'bg-gray-100': defineIsActive(radio) && isDisabled,
          'hover:border-primary': !isDisabled
        },
        '-mr-px last:m-0',
        'z-0 hover:z-10',
        'first:rounded-l last:rounded-r',
        normalizedContentClass
      ]"
      @click="handleSelect(radio)"
    >
      <slot
        v-if="isScopedSlot"
        :radio="radio"
        :isActive="defineIsActive(radio)"
      />
      <span v-else class="truncate">{{ radio.label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThBaseFormRadioGroupRadioGroupButtons',

  props: {
    value: { type: [String, Number, Boolean, Array], default: '' },
    list: { type: Array, required: true },
    contentClass: { type: [Object, String], default: '' },
    isDisabled: { type: Boolean, default: false },
    sizes: { type: Object, required: true }
  },

  data: () => ({
    isMounted: false
  }),

  computed: {
    isScopedSlot() {
      return Boolean(this.$scopedSlots.default)
    },
    isBasic() {
      return !this.isScopedSlot
    },

    normalizedContentClass() {
      const isWidthFull = this.isMounted
        ? this.$el.classList.contains('w-full')
        : false

      return [{ 'w-full': isWidthFull }, this.contentClass]
    }
  },

  mounted() {
    this.isMounted = true
  },

  methods: {
    handleSelect(selected) {
      if (this.isDisabled) return

      this.$emit('select', selected)
    },

    defineIsActive({ value }) {
      return this.value === value
    }
  }
}
</script>
