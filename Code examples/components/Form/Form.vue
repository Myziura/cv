<template>
  <div class="Form w-full" :class="contentClass">
    <!-- <el-form :class="contentClass" @submit.native.prevent> -->
    <slot />
    <!-- </el-form> -->
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'THBaseFormForm',

  props: {
    rules: { type: Object, default: () => ({}) },
    model: { type: Object, default: () => ({}) },
    name: { type: String, required: true },
    contentClass: { type: String, default: '' }
  },

  computed: {
    ...mapState('validation', ['forms']),

    formName() {
      return this.name
    },

    form() {
      return this.forms[this.formName]
    },

    fields() {
      return this.forms[this.formName].fields
    }
  },

  created() {
    this.createForm({
      name: this.formName,
      params: {
        validate: this.validate,
        fields: []
      }
    })
  },

  beforeDestroy() {
    this.removeForm(this.formName)
  },

  methods: {
    ...mapMutations('validation', {
      createForm: 'CREATE_FORM',
      removeForm: 'REMOVE_FORM'
    }),

    validate() {
      // const isValidateNames = Boolean(toValidateNames.length)
      //
      // let fields = this.fields
      //
      // if (isValidateNames) {
      //   fields = this.fields.filter((field) =>
      //     toValidateNames.includes(field.name)
      //   )
      // }
      //
      // return fields.map((field) => field.validate()).every(Boolean)
      return this.fields.map((field) => field.validate()).every(Boolean)
    }
  }
}
</script>
