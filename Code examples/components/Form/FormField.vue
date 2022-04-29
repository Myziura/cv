<template>
  <div
    class="FormField mb-0 flex flex-col justify-start items-start"
    :class="{
      'is-error': Boolean(error)
    }"
  >
    <!-- Label & optional message -->
    <div
      v-if="label"
      class="w-full mb-2 flex text-sm font-medium leading-4"
      :class="{
        'justify-between': isOptional.typeLine,
        'flex-col': isOptional.typeMultiline
      }"
    >
      <span
        class="text-gray-700"
        :class="{
          'mr-1': isOptional.typeLine,
          'flex-shrink-0 truncate': isLabel.typeLine
        }"
        :title="label"
      >
        {{ label }}
      </span>

      <span v-if="isOptional.visible" class="text-gray-400">
        {{ $t('forms.common.optional') }}
      </span>
    </div>

    <!-- Content -->
    <div
      v-loading="loading"
      element-loading-custom-class="rounded"
      class="h-full w-full"
    >
      <slot :error="error" />
    </div>

    <!-- Error message -->
    <!-- <template #error> -->
    <Collapse>
      <div v-if="isErrorMessageVisible">
        <div class="pt-2 flex">
          <span class="text-sm font-medium leading-4 text-red-500">
            {{ error }}
          </span>
        </div>
      </div>
    </Collapse>
    <!-- </template> -->
  </div>
</template>

<script>
import get from 'lodash/get'
import { mapState, mapMutations } from 'vuex'

import Collapse from '@/components/Common/Transitions/Collapse'

const LABEL_TYPES = Object.freeze({
  LINE: 'line',
  MULTILINE: 'multiline'
})

const OPTIONAL_TYPES = Object.freeze({
  LINE: 'line',
  MULTILINE: 'multiline'
})

export default {
  name: 'THBaseFormFormField',

  components: { Collapse },

  props: {
    label: { type: String, default: '' },
    labelType: {
      type: String,
      default: LABEL_TYPES.LINE,
      validator: (type) => Object.values(LABEL_TYPES).includes(type)
    },
    prop: { type: String, default: '' },
    optional: { type: Boolean, default: false },
    optionalType: {
      type: String,
      default: OPTIONAL_TYPES.LINE,
      validator: (type) => Object.values(OPTIONAL_TYPES).includes(type)
    },
    showOptional: { type: Boolean, default: true },
    showErrorMessage: { type: Boolean, default: true },
    loading: { type: Boolean, default: false }
  },

  data: () => ({
    error: ''
  }),

  computed: {
    ...mapState('validation', ['forms']),

    isOptional() {
      return {
        visible: this.optional && this.showOptional,
        typeLine: this.optionalType === OPTIONAL_TYPES.LINE,
        typeMultiline: this.optionalType === OPTIONAL_TYPES.MULTILINE
      }
    },

    isLabel() {
      return {
        typeLine: this.labelType === LABEL_TYPES.LINE,
        typeMultiline: this.labelType === LABEL_TYPES.MULTILINE
      }
    },

    isErrorMessageVisible() {
      return this.error && this.showErrorMessage
    },

    form() {
      let parent = this.$parent
      let parentName = parent.$options.name

      while (parentName !== 'THBaseFormForm') {
        parent = parent.$parent
        parentName = parent.$options.name
      }

      return parent
    },

    formName() {
      return this.form.formName
    },

    fieldValue() {
      return this.prop ? get(this.form.model, this.prop) : null
    }
  },

  watch: {
    fieldValue() {
      this.validate()
    }
  },

  mounted() {
    if (!this.prop) return

    this.addField({
      formName: this.formName,
      field: {
        name: this.prop,
        validate: this.validate
      }
    })
  },

  beforeDestroy() {
    if (!this.prop || !this.formName) return

    this.removeField({ formName: this.formName, fieldName: this.prop })
  },

  methods: {
    ...mapMutations('validation', {
      addField: 'ADD_FIELD',
      removeField: 'REMOVE_FIELD'
    }),

    validate() {
      // If no prop value
      if (!this.prop || !this.form.rules[this.prop]) {
        this.clearError()
        return true
      }

      // If optional and no value
      if (this.optional && !this.fieldValue) {
        this.form.rules[this.prop]()
        this.clearError()
        return true
      }
      const error = this.form.rules[this.prop]()
      this.error = error
      return !error
    },

    clearError() {
      this.error = ''
    }
  }
}
</script>

<style lang="scss">
.FormField {
  @apply w-full flex flex-col items-start justify-start;

  .el-form-item {
    &__label {
      @apply mb-1 flex text-left text-sm font-medium leading-6;
    }

    &__content {
      @apply h-full w-full flex flex-col leading-6;
    }

    &__error {
      @apply static leading-normal;
    }
  }
}
</style>
