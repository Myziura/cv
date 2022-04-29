<template>
  <component
    :is="component"
    :list="list"
    :value="value"
    :content-class="contentClass"
    :is-disabled="isDisabled"
    :sizes="sizes"
    @select="handleSelect"
  >
    <template
      v-if="Boolean($scopedSlots.default)"
      #default="{ radio, isActive }"
    >
      <slot :radio="radio" :is-active="isActive" />
    </template>
  </component>
</template>

<script>
import RadioButtons from '@/components/Base/Form/RadioGroup/RadioGroupButtons'

const TYPES = Object.freeze({
  BASIC: 'basic',
  BUTTONS: 'buttons'
})

const SIZES = Object.freeze({
  MEDIUM: 'medium',
  SMALL: 'small'
})

const defineIsAllRequiredProperties = (list) => {
  if (!list.length) return

  const isAllRequiredProperties = list.every(
    (radio) =>
      Object.prototype.hasOwnProperty.call(radio, 'value') &&
      Object.prototype.hasOwnProperty.call(radio, 'label')
  )

  return isAllRequiredProperties
}

export default {
  name: 'ThBaseFormRadioGroupRadioGroup',

  components: { RadioButtons },

  props: {
    value: { type: [String, Number, Boolean, Array], default: '' },
    list: {
      type: Array,
      required: true,
      validator: defineIsAllRequiredProperties
    },
    type: {
      type: String,
      default: TYPES.BASIC,
      validator: (value) => Object.values(TYPES).includes(value)
    },
    size: {
      type: String,
      default: SIZES.MEDIUM,
      validator: (value) => Object.values(SIZES).includes(value)
    },
    isDisabled: { type: Boolean, default: false },
    contentClass: { type: [Object, String], default: '' }
  },

  computed: {
    component() {
      // RadioBasic
      return this.types.isBasic ? 'RadioButtons' : 'RadioButtons'
    },

    types() {
      return {
        isBasic: this.type === TYPES.BASIC,
        isButtons: this.type === TYPES.BUTTONS
      }
    },

    sizes() {
      return {
        isMedium: this.size === SIZES.MEDIUM,
        isSmall: this.size === SIZES.SMALL
      }
    }
  },

  methods: {
    handleSelect(selected) {
      this.$emit('select', selected)
    }
  }
}
</script>
