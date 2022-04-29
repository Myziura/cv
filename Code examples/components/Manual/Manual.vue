<template>
  <Form
    class="Manual flex flex-col"
    name="driverRaceManualForm"
    :rules="rules"
    :model="formData"
  >
    <Dispatcher v-if="isCreatorDispatcher" :form.sync="formData" />

    <Driver
      v-if="isCreatorDriver"
      :form.sync="formData"
      @create-race="$emit('create-race')"
      @close="$emit('close')"
    />
  </Form>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import Form from '@/components/Base/Form/Form'
import Dispatcher from '@/components/DriverRace/Forms/Manual/ManualDispatcher'
import Driver from '@/components/DriverRace/Forms/Manual/ManualDriver/ManualDriver'

export default {
  name: 'THDriverRaceFormsManualManual',

  components: {
    Form,
    Dispatcher,
    Driver
  },

  computed: {
    ...mapGetters('driverRace/workspace', {
      isCreatorDispatcher: 'IS_CREATOR_DISPATCHER',
      isCreatorDriver: 'IS_CREATOR_DRIVER'
    }),

    formData: {
      get() {
        return this.$store.state.driver.race.form.data
      },
      set(value) {
        this.updateRaceForm(value)
      }
    },

    commonRules() {
      return {
        vehicleNumber: () =>
          this.formData.vehicleNumber
            ? ''
            : this.$t('forms.common.validation.vehicleNumber'),
        trailerNumber: () =>
          this.formData.trailerNumber
            ? ''
            : this.$t('forms.common.validation.trailerNumber'),

        pointFromKoatuu: () =>
          this.formData.pointFromKoatuu
            ? ''
            : this.$t('forms.common.validation.pointFrom'),
        warehouseToCode: () =>
          this.formData.warehouseToCode
            ? ''
            : this.$t('forms.common.validation.pqWarehouse'),

        carrierName: () => {
          if (!this.formData.carrierName) {
            return this.$t('forms.common.validation.carrier')
          }

          const isEdrpou = !Number.isNaN(
            Number(this.formData.carrierName.charAt(0))
          )

          if (isEdrpou) {
            return this.$t(`forms.common.validation.carrierName`)
          }

          return ''
        },

        goodsName: () =>
          this.formData.goodsName
            ? ''
            : this.$t('forms.common.validation.goods')
      }
    },

    dispatcherRules() {
      return {
        driverPhone: () =>
          this.formData.driverPhone
            ? ''
            : this.$t('forms.common.validation.phone'),
        driverCert: () =>
          this.formData.driverCert
            ? ''
            : this.$t('forms.common.validation.certSerialNumber'),
        driverFullname: () =>
          this.formData.driverFullname
            ? ''
            : this.$t('forms.common.validation.fullname')
      }
    },

    rules() {
      return {
        ...this.commonRules,
        ...(this.isCreatorDispatcher && this.dispatcherRules)
      }
    }
  },

  created() {
    this.setWrapper({
      title: this.$t('forms.driverWorkspace.newRace.titleManual')
    })
  },

  methods: {
    ...mapMutations('driver/race/form', {
      updateRaceForm: 'UPDATE_RACE_FORM'
    }),
    ...mapMutations('driverRace/workspace', {
      setWrapper: 'SET_WRAPPER'
    })
  }
}
</script>
