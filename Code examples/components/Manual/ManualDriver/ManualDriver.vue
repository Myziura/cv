<template>
  <div class="ManualDriver h-full grid grid-cols-6 gap-4 p-4">
    <FormField
      class="col-span-3 xs:col-span-6"
      :label="$t('forms.common.vehicleNumber')"
      prop="vehicleNumber"
    >
      <FormInput
        v-uppercase
        v-only.number.latin.cyrillic
        class="w-full"
        :placeholder="$t('forms.common.vehicleNumber')"
        is-clearable
        :words-limit="8"
        :value="form.vehicleNumber"
        @input="(value) => updateForm({ vehicleNumber: value })"
      />
    </FormField>

    <FormField
      class="col-span-3 xs:col-span-6"
      :label="$t('forms.common.vehicleWithTrailer')"
    >
      <RadioGroupBoolean
        class="w-full"
        :value="form.vehicleWithTrailer"
        @select="({ value }) => updateForm({ vehicleWithTrailer: value })"
      />
    </FormField>

    <FormField
      v-if="form.vehicleWithTrailer"
      class="col-span-3 xs:col-span-6"
      prop="trailerNumber"
      :label="$t('forms.common.trailerNumber')"
    >
      <FormInput
        v-uppercase
        v-only.number.latin.cyrillic
        class="w-full"
        :placeholder="$t('forms.common.trailerNumber')"
        is-clearable
        :words-limit="8"
        :value="form.trailerNumber"
        @input="(value) => updateForm({ trailerNumber: value })"
      />
    </FormField>

    <FormField
      class="col-span-6"
      :label="$t(`forms.common.pointFrom`)"
      prop="pointFromKoatuu"
    >
      <template #default="{ error }">
        <PointSelect
          class="col-span-3"
          :type="TYPES.FROM"
          :form="form"
          :error="Boolean(error)"
          @update-form="updateForm"
        />
      </template>
    </FormField>

    <FormField
      class="col-span-6"
      :label="$t(`forms.common.pointTo`)"
      prop="warehouseToCode"
    >
      <template #default="{ error }">
        <PointSelect
          class="col-span-3"
          :type="TYPES.TO"
          :form="form"
          :error="Boolean(error)"
          @update-form="updateForm"
        />
      </template>
    </FormField>

    <FormField
      class="col-span-6"
      :label="$t('forms.common.goods')"
      prop="goodsName"
      :show-error-message="!isGoodsSelectDisabled"
    >
      <template #default="{ error }">
        <GoodsSelect
          :warehouse-from-guid="form.warehouseFromGuid"
          :warehouse-to-guid="form.warehouseToGuid"
          :value="form.goodsName"
          :error="Boolean(error)"
          :disabled="isGoodsSelectDisabled"
          @select="
            ({ guid, name = '' }) =>
              updateForm({ goodsGuid: guid, goodsName: name })
          "
        />
      </template>
    </FormField>

    <FormField
      class="col-span-6"
      :label="$t('forms.common.carrier')"
      prop="carrierName"
    >
      <template #default="{ error }">
        <CounterpartySelect
          :value="form.carrierName"
          :error="Boolean(error)"
          filterable
          allow-create
          @select="
            ({ name = '', guid = '' }) =>
              updateForm({ carrierName: name, carrierGuid: guid })
          "
        />
      </template>
    </FormField>

    <Additional class="col-span-6" />

    <DriverInfo class="col-span-6" :driver="$store.state.driver" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

// import allowSomeCharacters from '@/mixins/allowSomeCharacters'

import FormField from '@/components/Base/Form/FormField'
import FormInput from '@/components/Base/Form/FormInput'

import DriverInfo from '@/components/DriverRace/Forms/Manual/ManualDriver/ManualDriverDriverInfo'
import Additional from '@/components/DriverRace/Forms/Additional/Additional'

import RadioGroupBoolean from '@/components/Common/CommonRadioGroupBoolean'
import PointSelect from '@/components/DriverRace/Forms/Manual/ManualPointSelect'
import GoodsSelect from '@/components/Common/GoodsSelect/GoodsSelect'
import CounterpartySelect from '@/components/Common/CounterpartySelect/CounterpartySelect'

const TYPES = Object.freeze({
  TO: 'To',
  FROM: 'From'
})

export default {
  name: 'THDriverRaceFormsManualManualDesktop',

  components: {
    FormField,
    FormInput,

    DriverInfo,
    Additional,

    RadioGroupBoolean,
    GoodsSelect,
    PointSelect,
    CounterpartySelect
  },

  // mixins: [allowSomeCharacters()],

  props: {
    form: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapGetters('driverRace/workspace', {
      isDispather: 'IS_CREATOR_DISPATCHER'
    }),

    isGoodsSelectDisabled() {
      return !this.form.pointFromKoatuu || !this.form.warehouseToCode
    },

    footerButtons() {
      return [
        {
          props: { label: this.$t('forms.common.cancelRaceCreation') },
          handler: () => this.$emit('close')
        },
        {
          props: { label: this.$t('forms.common.createRace'), type: 'primary' },
          handler: () => this.$emit('create-race')
        }
      ]
    }
  },

  created() {
    this.TYPES = TYPES

    this.setWrapper({ footerButtons: this.footerButtons })
  },

  mounted() {
    // MYZIURA create directive
    document.getElementById('ModalContent').scrollTop = 0
  },

  methods: {
    ...mapMutations('driverRace/workspace', {
      setWrapper: 'SET_WRAPPER'
    }),
    updateForm(payload) {
      this.$emit('update:form', { ...this.form, ...payload })
    }
  }
}
</script>
