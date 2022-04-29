<template>
  <div class="w-full flex flex-col">
    <div class="w-full mb-1 flex font-medium">
      <span class="text-sm text-gray-700 truncate mr-1">
        {{ $t('forms.common.driver') }}
      </span>

      <nuxt-link
        :to="$i18n.path('driver/settings/driver-profile')"
        class="ml-auto text-primary underline font-semibold"
      >
        {{ $t('forms.common.edit') }}
      </nuxt-link>
    </div>

    <div
      class="BaseDriver px-4 py-2 flex flex-col bg-white border rounded text-sm"
    >
      <Block
        v-for="({ label, value }, index) of blocks"
        :key="index"
        :label="label"
        :value="value"
      />
    </div>
  </div>
</template>

<script>
import { PERSON_DOCS_TYPE } from '@/utils/drivers'

const Block = {
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },

  render(h) {
    const self = this
    return h('div', { class: 'mb-1 flex font-medium last:mb-0' }, [
      h('span', { class: 'mr-2 flex text-gray-500' }, `${self.label}:`),
      h('span', { class: 'text-gray-700' }, self.value)
    ])
  }
}

export default {
  components: { Block },

  props: {
    driver: { type: Object, required: true }
  },

  data: () => ({
    visible: false
  }),

  computed: {
    serialNumber() {
      return this.driver.driverCert || this.driver.certSerialNumber
    },

    // passDate() {
    //   return new Date(this.driver.passDate).pFormatDate()
    // },

    // idCardDate() {
    //   return new Date(this.driver.idCardDate).pFormatDate()
    // },

    isPassportDocument() {
      return (
        this.driver.personDocsType === PERSON_DOCS_TYPE.PASSPORT &&
        this.driver.passSerial &&
        this.driver.passNumber
      )
    },

    isCardDocument() {
      return (
        this.driver.personDocsType === PERSON_DOCS_TYPE.ID_CARD &&
        this.driver.idCardNumber
      )
    },

    blocks() {
      return [
        this.serialNumber && {
          label: this.$t('forms.driverWorkspace.newRace.driverIdCard'),
          value: this.serialNumber
        },
        this.isPassportDocument && {
          label: this.$t('forms.driverWorkspace.newRace.driverPassport'),
          value: `${this.driver.passSerial}${this.driver.passNumber}`
        },
        this.driver.passDate && {
          label: this.$t('forms.driverWorkspace.newRace.driverDate'),
          value: this.driver.passDate
        },
        this.driver.passIssued && {
          label: this.$t('forms.driverWorkspace.newRace.driverIssued'),
          value: this.driver.passIssued
        },

        this.isCardDocument && {
          label: this.$t('forms.common.idCard'),
          value: this.driver.idCardNumber
        },
        this.driver.idCardDate && {
          label: this.$t('forms.driverWorkspace.newRace.driverDate'),
          value: this.driver.idCardDate
        },
        this.driver.idCardIssued && {
          label: this.$t('forms.driverWorkspace.newRace.driverIssued'),
          value: this.driver.idCardIssued
        }
      ].filter(Boolean)
    }
  }
}
</script>
