/* eslint-disable no-undef */
import * as notify from '@/utils/notify'
import { PAGE_SIZE } from '@/utils/defaultValues'

export const state = () => ({
  states: {
    limit: PAGE_SIZE,
    offset: 0,
    list: [],
    count: 0,
    selected: [],
    filters: {
      vehicleNumber: ''
    },
    loading: false
  }
})

export const mutations = {
  SET_LIST(state, list) {
    state.states.list = list
  },
  SET_OFFSET(state, offset) {
    state.states.offset = offset
  },
  SET_COUNT(state, count) {
    state.states.count = count
  },
  SET_SELECTED(state, selected) {
    state.states.selected = selected
  },
  SET_FILTERS(state, filters = {}) {
    state.states.filters = filters
  },
  SET_LOADING(state, loading) {
    state.states.loading = loading
  }
}

export const actions = {
  async FETCH_LIST({ state, commit, rootGetters }, payload = {}) {
    commit('SET_LOADING', true)

    try {
      payload = {
        limit: state.states.limit,
        offset: state.states.offset,
        carrierGuid: rootGetters['accreditations/DEFAULT_CARRIER_GUID'],
        ordererGuid: rootGetters['accreditations/DEFAULT_ORDERER_GUID'],
        ...state.states.filters,
        ...payload
      }

      const {
        status,
        count,
        states
      } = await this.$api.accreditations.getStates(payload)

      if (status) {
        if (state.states.offset === 0) {
          await commit('SET_LIST', states)
          await commit('SET_SELECTED', [])
        } else {
          await commit('SET_LIST', [...state.states.list, ...states])
        }
        await commit('SET_COUNT', count)
      }
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)
  },

  async CREATE({ commit, dispatch, rootGetters }, payload = {}) {
    commit('SET_LOADING', true)

    try {
      payload = {
        carrierGuid: rootGetters['accreditations/DEFAULT_CARRIER_GUID'],
        ordererGuid: rootGetters['accreditations/DEFAULT_ORDERER_GUID'],
        ...payload
      }

      const { status } = await this.$api.accreditations.createStates(payload)

      if (status) {
        await commit('SET_OFFSET', 0)
        await dispatch('FETCH_LIST')

        notify.success({
          text: $nuxt.$t(`forms.common.aDraftForAccreditationHasBeenCreated`)
        })
      }
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)
  },

  async UPDATE({ commit, dispatch, state }, payload = {}) {
    commit('SET_LOADING', true)

    try {
      payload = {
        statesGuids: (state.states.selected || []).map(
          (selected) => selected.guid
        ),
        ...payload
      }

      const status = await this.$api.accreditations.updateStates(payload)

      await commit('SET_OFFSET', 0)
      await dispatch('FETCH_LIST')

      if (status) {
        notify.success({
          // eslint-disable-next-line no-undef
          text: $nuxt.$t(`forms.common.accreditationRequestUpdated`)
        })
      }
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)
  },

  async DELETE({ commit, state, dispatch }, payload = {}) {
    commit('SET_LOADING', true)

    let status = false

    try {
      payload = {
        statesGuids: (state.states.selected || []).map(
          (selected) => selected.guid
        ),
        ...payload
      }

      status = await this.$api.accreditations.deleteStates(payload)

      if (status) {
        await commit('SET_OFFSET', 0)
        await dispatch('FETCH_LIST')

        notify.success({
          // eslint-disable-next-line no-undef
          text: $nuxt.$t(`forms.common.theDraftHasBeenDeleted`)
        })

        if (state.states.list.length === 0) {
          dispatch('accreditations/FETCH_LIST', {}, { root: true })
        }
      }
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)

    return status
  }
}
