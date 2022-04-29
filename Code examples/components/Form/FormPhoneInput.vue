<template>
  <div
    class="FormPhoneInput h-10 inline-flex bg-white border border-gray-300 rounded overflow-hidden duration-150"
    :class="{
      'border-red-500': error,
      'border-primary': input.isFocused,
      'bg-gray-100': isDisabled
    }"
  >
    <StaticSelect
      style="max-width: 128px !important"
      class="border-r border-gray-300"
      :placeholder="$t(`forms.common.country`)"
      :list="countries.list"
      :value="countries.selected.code"
      is-nested
      :disabled="isDisabled"
      :desktop-popover-width="384"
      @select="handleSelectCountry"
    >
      <template #input-value>
        <div class="flex items-center">
          <img class="h-4 w-6 mr-4" :src="countries.selected.flag" />
          <span>{{ countries.selected.code }}</span>
        </div>
      </template>

      <template #list-item="{ item }">
        <div class="flex items-start overflow-hidden">
          <div class="flex items-center flex-shrink-0">
            <img class="h-4 w-6 mr-4" :src="item.flag" :alt="item.name" />
            <span class="w-10 mr-4">{{ item.code }}</span>
          </div>
          <span class="truncate">{{ item.name }}</span>
        </div>
      </template>
    </StaticSelect>

    <FormInput
      class="h-full w-full"
      inputmode="numeric"
      :words-limit="phoneNumberLength"
      :is-visible-words-limit="false"
      :placeholder="phoneNumberPlaceholder"
      :is-autofocus="isAutofocus"
      :is-disabled="isDisabled"
      is-clearable
      is-nested
      :value="input.value"
      @input="handleInput"
      @focus="() => handleSetInputFocused(true)"
      @blur="() => handleSetInputFocused(false)"
      @keyup.enter="$emit('keyup-enter')"
    />
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'

import FormInput from '@/components/Base/Form/FormInput'
import StaticSelect from '@/components/Common/StaticSelect/StaticSelect'

import countries from '@/assets/country-codes-list'

const MAX_PHONE_LENGTH = 15

const getCountryByCode = (code) =>
  countries.filter((country) => country.code === code)[0] || countries[208]

const destructurelizeNumberWithCode = (numberWithCode) => {
  const country = countries.find((item) =>
    new RegExp(`^${item.code}`).test(numberWithCode)
  )
  const number = numberWithCode.split(country.code)[1]

  return { country, number }
}

export default {
  name: 'THBaseFormFormPhoneInput',

  components: { FormInput, StaticSelect },

  props: {
    value: {
      type: Object,
      default: () => ({ code: '380', number: '', numberWithCode: '' })
    },
    isAutofocus: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    error: { type: Boolean, default: false }
  },

  data: () => ({
    input: { value: '', isFocused: false },
    countries: { list: countries, selected: countries[208] }
  }),

  computed: {
    phoneNumberLength() {
      return this.countries.selected.phoneNumberLength || MAX_PHONE_LENGTH
    },
    phoneNumberPlaceholder() {
      const placeholderArray = []
      placeholderArray.length = this.phoneNumberLength
      const placeholder = placeholderArray.fill('0').join('')
      return placeholder
    }
  },

  watch: {
    value: {
      handler(value, oldValue) {
        if (isEqual(value, oldValue)) return

        if (!value.number && !value.numberWithCode) this.handleClear()
      }
    }
  },

  created() {
    if (this.value.number || this.value.numberWithCode) {
      this.handleSetDefault()
    }
  },

  methods: {
    handleSetDefault() {
      let result = { country: '', number: '' }

      if (this.value.numberWithCode) {
        const { country, number } = destructurelizeNumberWithCode(
          this.value.numberWithCode
        )
        result = { country, number }
      } else if (this.value.number) {
        result = {
          country: getCountryByCode(this.value.code),
          number: this.value.number
        }
      }

      this.handleSelectCountry(result.country, { isInitial: true })
      this.handleInput(result.number, { isInitial: true })
    },

    handleInput(value = '', options = { isInitial: false }) {
      const candidatePhoneNumber = value.pToPositiveInteger()
      const code = this.countries.selected.code
      const payload = {
        code,
        number: candidatePhoneNumber,
        numberWithCode: candidatePhoneNumber
          ? `${code}${candidatePhoneNumber}`
          : ''
      }

      this.input.value = candidatePhoneNumber

      options.isInitial
        ? this.$emit('initial-input', payload)
        : this.$emit('input', payload)

      if (candidatePhoneNumber.length === this.phoneNumberLength) {
        this.$emit('submit', payload)
      }
    },

    handleSelectCountry(country, options) {
      this.countries.selected = country
      this.handleInput(this.input.value, options)
    },

    handleSetInputFocused(isFocused) {
      this.input.isFocused = isFocused
    },

    handleClear() {
      this.handleInput('')
    }
  }
}
</script>
