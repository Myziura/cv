<template>
  <label
    class="flex items-center cursor-pointer"
    :class="{
      'cursor-not-allowed': isDisabled
    }"
    @click="handleToggle"
  >
    <div
      class="h-6 w-6 flex flex-shrink-0 items-center justify-center bg-white border rounded duration-150"
      :class="{
        'bg-gray-100': isDisabled,
        'bg-primary border-primary':
          (isActive || isIndeterminate) && !isDisabled
      }"
    >
      <BaseIcon
        v-if="isActive"
        class="h-4 w-4 leading-4 text-white duration-150"
        :class="{
          'text-gray-300': isDisabled
        }"
        name="check"
      />
      <div
        v-if="isIndeterminate && !isActive"
        class="w-4 bg-white duration-150"
        :class="{
          'bg-gray-300': isDisabled
        }"
        style="height: 3px"
      />
    </div>

    <span
      v-if="label"
      class="ml-2 text-black font-medium leading-3 select-none"
      :class="{
        'text-primary': isActive
      }"
    >
      {{ label }}
    </span>
  </label>
</template>

<script>
export default {
  name: 'ThBaseFormFormCheckbox',

  props: {
    value: { type: Boolean, default: false },
    label: { type: String, default: '' },
    isDisabled: { type: Boolean, default: false },
    isIndeterminate: { type: Boolean, default: false }
  },

  data: () => ({
    isActive: false
  }),

  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.isActive = value
      }
    }
  },

  methods: {
    handleToggle() {
      if (this.isDisabled) return

      this.isActive = !this.isActive
      this.$emit('change', this.isActive)
    }
  }
}
</script>
