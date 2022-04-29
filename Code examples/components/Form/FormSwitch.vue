<template>
  <div :class="{ 'cursor-not-allowed': disabled }">
    <div class="FormSwitch" :disabled="disabled">
      <label class="flex items-center cursor-pointer" @click="handleToggle">
        <div
          class="h-6 w-12 flex flex-shrink-0 items-center bg-gray-200 rounded-full duration-300"
          :class="{
            'bg-primary': isActive
          }"
        >
          <div
            class="h-6 w-6 flex items-center justify-center duration-300"
            style="padding: 3px"
            :style="`transform: translateX(${translateX}%);`"
          >
            <div class="h-full w-full bg-white rounded-full shadow" />
          </div>
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThBaseFormSwitchFormSwitch',

  props: {
    value: { type: Boolean, default: false },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },

  data: () => ({
    isActive: false
  }),

  computed: {
    translateX() {
      return this.isActive ? '100' : '0'
    }
  },

  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.isActive = value
      }
    }
  },

  created() {
    this.isActive = this.value
  },

  methods: {
    handleToggle() {
      this.isActive = !this.isActive
      this.$emit('change', this.isActive)
    }
  }
}
</script>

<style lang="scss" scoped>
.FormSwitch[disabled] {
  opacity: 0.6;
  pointer-events: none;
}
</style>
