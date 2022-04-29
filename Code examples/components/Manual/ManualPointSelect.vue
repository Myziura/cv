<template>
  <div
    class="ManualPointSelect border rounded border-gray-300 overflow-hidden"
    :class="{ 'border-red-500': error }"
  >
    <SettlementSelect
      ref="settlementSelect"
      :active-type="type"
      :settlement-code="settlementCode"
      :input-labels="false"
      :readonly="readonly"
      @select="handleSelectSettlement"
    />

    <WarehouseSelect
      ref="warehouseSelect"
      class="border-t border-gray-300"
      :settlement-code="settlementCode"
      :pq-queue-profile-guid="pqQueueProfileGuid"
      :value="warehouseValue"
      :clearable="!readonly"
      is-nested
      :select-first-by-default="selectFirstWarehouseByDefault"
      :disabled="isWarehouseDisabled"
      :mobile-footer-buttons="footerButtonsForWarehouseSelectMobile"
      :before-select="handleBeforeSelectWarehouse"
      @select="handleSelectWarehouse"
      @initial-select="handleInitialSelectWarehouse"
    >
      <template #list-item="{ item }">
        <div class="flex flex-col">
          <span>{{ item.name }}</span>
          <small class="text-gray-500">{{ item.fullAddress }}</small>
          <small v-if="item.bdOn && type === TYPES.FROM" class="text-red-500">
            {{ $t('forms.common.byThisWarehouseRaceCreateAutomatically') }}
          </small>
        </div>
      </template>
    </WarehouseSelect>

    <PartialSheet
      v-if="notAllowedWarehouse.visible"
      id="notAllowedWarehouse"
      ref="notAllowedWarehouse"
      :header-title="
        getNotAllowedWarehouseError(notAllowedWarehouse.selected.name)
      "
      :footer-buttons="footerButtonsForNotAllowedWarehouse"
      @close="notAllowedWarehouse = { visible: false, selected: null }"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

import * as notify from '@/utils/notify'
import { POINT } from '@/utils/point'

import PartialSheet from '@/components/Base/PartialSheet/PartialSheet'

import SettlementSelect from '@/components/Common/SettlementSelect/SettlementSelect'
import WarehouseSelect from '@/components/Common/WarehouseSelect/WarehouseSelect'

const TYPES = Object.freeze({
  TO: 'To',
  FROM: 'From'
})

export default {
  name: 'THDriverRaceFormsManualManualPointSelect',

  components: { PartialSheet, SettlementSelect, WarehouseSelect },

  props: {
    type: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      required: true
    },
    error: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    pqQueueProfileGuid: {
      type: String,
      default: ''
    },
    selectFirstWarehouseByDefault: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    notAllowedWarehouse: {
      visible: false,
      selected: null
    }
  }),

  computed: {
    ...mapGetters('driverRace/workspace', {
      isCreatorDispatcher: 'IS_CREATOR_DISPATCHER',
      isCreatorDriver: 'IS_CREATOR_DRIVER'
    }),

    settlementCode() {
      return this.form[`point${this.type}Koatuu`]
    },
    warehouseValue() {
      return this.form[`warehouse${this.type}Name`]
    },
    clearWarehouse() {
      return {
        [`warehouse${this.type}Guid`]: '',
        [`warehouse${this.type}Code`]: '',
        [`warehouse${this.type}Name`]: '',
        ...this.clearGoods
      }
    },
    clearGoods() {
      return { goodsName: '', goodsGuid: '' }
    },

    isWarehouseDisabled() {
      return !this.settlementCode
    },

    footerButtonsForWarehouseSelectMobile() {
      return [
        this.type === TYPES.FROM && {
          props: { label: this.$t('forms.common.anotherWarehouse') },
          handler: this.handleClearAndCloseWarehouseSelection
        },
        {
          props: { label: this.$t('forms.common.changeSettlement') },
          handler: this.handleOpenSelectRegion
        }
      ].filter(Boolean)
    },

    footerButtonsForNotAllowedWarehouse() {
      return [
        {
          props: { label: this.$t('forms.common.cancelRaceCreation') },
          handler: this.handleCloseRaceCreation
        },
        {
          props: { label: this.$t('forms.common.selectAnotherWarehouse') },
          handler: this.handleCloseNotAllowedWarehouse
        }
      ]
    }
  },

  created() {
    this.TYPES = TYPES
  },

  methods: {
    ...mapMutations('driver/race/form', {
      updateDefaultRaceForm: 'UPDATE_DEFAULT_RACE_FORM'
    }),

    getNotAllowedWarehouseError(warehouseName) {
      return this.$t(
        'forms.driverWorkspace.forThisWarehouseRaceCreatesAutomatically',
        {
          warehouseName
        }
      )
    },

    async handleSelectSettlement({ settlementCode }) {
      await this.$emit('update-form', {
        [`point${this.type}Koatuu`]: settlementCode,
        ...this.clearWarehouse
      })

      if (this.isCreatorDriver && settlementCode) {
        this.$refs.warehouseSelect.handleActivate()
      }
    },

    handleBeforeSelectWarehouse(selected) {
      if (this.isCreatorDispatcher) {
        return true
      }

      if (selected.bdOn && this.type === TYPES.FROM) {
        this.notAllowedWarehouse = { visible: true, selected }
        return false
      } else {
        return true
      }
    },

    handleSelectWarehouse({ guid, classificatorCode, name, bdOn }) {
      if (bdOn && this.type === TYPES.FROM && this.isCreatorDispatcher) {
        notify.error({ text: this.getNotAllowedWarehouseError(name) })
        return
      }

      this.$emit('update-form', {
        [`warehouse${this.type}Guid`]: guid,
        [`warehouse${this.type}Code`]: classificatorCode,
        [`warehouse${this.type}Name`]: name,
        ...this.clearGoods
      })
    },

    handleInitialSelectWarehouse({ guid, classificatorCode, name }) {
      this.updateDefaultRaceForm({
        [`warehouse${this.type}Guid`]: guid,
        [`warehouse${this.type}Code`]: classificatorCode,
        [`warehouse${this.type}Name`]: name
      })
    },

    handleClearAndCloseWarehouseSelection() {
      this.$refs.warehouseSelect.handleClear()
      this.$refs.warehouseSelect.handleClose()
    },

    async handleOpenSelectRegion() {
      await this.$refs.warehouseSelect.handleClose()
      await this.$refs.settlementSelect.triggerCleanInput(POINT.SETTLEMENT.KEY)
      this.$refs.settlementSelect.handleOpenModal(POINT.REGION.KEY)
    },

    handleCloseNotAllowedWarehouse() {
      this.$refs.notAllowedWarehouse.handleClose()
    },

    handleCloseRaceCreation() {
      this.handleCloseNotAllowedWarehouse()
      this.$router.push(this.$i18n.path('driver'))
    }
  }
}
</script>

<style lang="scss">
.ManualPointSelect {
  // .SettlementSelectInputs {
  //   &__form-item {
  //     border-bottom: 1px solid $--border-color-base;
  //
  //     input {
  //       border-radius: 0;
  //       border: 0;
  //     }
  //   }
  // }

  .WarehouseSelect {
    .SelectInput {
      &__content {
        border-radius: 0;
        border: 0;
      }
    }
  }
}
</style>
