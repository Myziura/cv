<template>
  <FormBlock
    v-resize:window="handleResize"
    class="ManualDispatcher"
    :title="$t('forms.common.race')"
    :subtitle="$t('forms.common.fillInAllFields')"
    content-class="p-0 flex flex-col"
  >
    <Driver class="mb-8" :form="form" @update-form="updateForm" />

    <div class="p-4 grid grid-cols-6 gap-4 bg-white border rounded-lg">
      <FormField
        class="col-span-2"
        :label="$t('forms.common.vehicleNumber')"
        prop="vehicleNumber"
      >
        <FormInput
          v-uppercase
          class="w-full"
          :placeholder="$t('forms.common.vehicleNumber')"
          is-disabled
          :value="form.vehicleNumber"
        />
      </FormField>

      <FormField
        class="col-span-2"
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
        prop="trailerNumber"
        class="col-span-2"
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
        class="col-span-3"
        :label="$t(`forms.common.pointFrom`)"
        prop="pointFromKoatuu"
      >
        <template #default="{ error }">
          <PointSelect
            class="col-span-3"
            :type="TYPES.FROM"
            :form="form"
            :error="Boolean(error)"
            :readonly="isDirectionLoading"
            :pq-queue-profile-guid="isDirectionLoading ? profile.guid : ''"
            :select-first-warehouse-by-default="isDirectionLoading"
            @update-form="updateForm"
          />
        </template>
      </FormField>

      <FormField
        class="col-span-3"
        :label="$t(`forms.common.pointTo`)"
        prop="pointToKoatuu"
      >
        <template #default="{ error }">
          <PointSelect
            class="col-span-3"
            :type="TYPES.TO"
            :form="form"
            :error="Boolean(error)"
            :readonly="isDirectionUnloading"
            :pq-queue-profile-guid="isDirectionUnloading ? profile.guid : ''"
            :select-first-warehouse-by-default="isDirectionUnloading"
            @update-form="updateForm"
          />
        </template>
      </FormField>

      <FormField
        class="col-span-3"
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
            clearable
            @select="
              ({ guid, name }) =>
                updateForm({ goodsGuid: guid, goodsName: name })
            "
          />
        </template>
      </FormField>

      <FormField
        class="col-span-3"
        :label="$t('forms.common.carrier')"
        prop="carrierName"
      >
        <template #default="{ error }">
          <CounterpartySelect
            :value="form.carrierName"
            :error="Boolean(error)"
            filterable
            is-custom-action
            allow-create
            @select="
              ({ name = '', guid = '' }) =>
                updateForm({ carrierName: name, carrierGuid: guid })
            "
          />
        </template>
      </FormField>
    </div>
  </FormBlock>
</template>

<script>
import { mapGetters } from 'vuex'

// import allowSomeCharacters from '@/mixins/allowSomeCharacters'

import { DIRECTIONS } from '@/utils/pq.queues'

import FormBlock from '@/components/Base/Form/FormBlock'
import FormField from '@/components/Base/Form/FormField'
import FormInput from '@/components/Base/Form/FormInput'

import RadioGroupBoolean from '@/components/Common/CommonRadioGroupBoolean'
import PointSelect from '@/components/DriverRace/Forms/Manual/ManualPointSelect'
import GoodsSelect from '@/components/Common/GoodsSelect/GoodsSelect'
import CounterpartySelect from '@/components/Common/CounterpartySelect/CounterpartySelect'

import Driver from '@/components/DriverRace/Forms/Driver/DriverDispatcher'

const TYPES = Object.freeze({
  TO: 'To',
  FROM: 'From'
})

export default {
  name: 'THDriverRaceFormsManualManualDesktop',

  components: {
    FormBlock,
    FormField,
    FormInput,

    RadioGroupBoolean,
    GoodsSelect,
    PointSelect,
    CounterpartySelect,

    Driver
  },

  mixins: [
    // allowSomeCharacters(),
    require('@/mixins/breakpoints').default
  ],

  props: {
    form: { type: Object, required: true }
  },

  computed: {
    ...mapGetters('driver/queues', ['profile', 'queue']),
    ...mapGetters('driverRace/workspace', {
      isDispather: 'IS_CREATOR_DISPATCHER'
    }),

    isDirectionLoading() {
      return this.profile.direction === DIRECTIONS.LOADING
    },
    isDirectionUnloading() {
      return this.profile.direction === DIRECTIONS.UNLOADING
    },

    isGoodsSelectDisabled() {
      return !this.form.pointFromKoatuu || !this.form.pointToKoatuu
    }
  },

  created() {
    this.TYPES = TYPES
  },

  methods: {
    updateForm(payload) {
      this.$emit('update:form', { ...this.form, ...payload })
    }
  }
}
</script>
