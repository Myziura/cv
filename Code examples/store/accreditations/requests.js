import * as notify from '@/utils/notify'
import { PAGE_SIZE } from '@/utils/defaultValues'

export const state = () => ({
  requests: {
    limit: PAGE_SIZE,
    offset: 0,
    list: [],
    count: 0,
    filters: {
      vehicleNumber: null
    },
    loading: false
  }
})

export const mutations = {
  SET_LIST(state, list) {
    state.requests.list = list
  },
  SET_OFFSET(state, offset) {
    state.requests.offset = offset
  },
  SET_COUNT(state, count) {
    state.requests.count = count
  },
  SET_FILTERS(state, filters = {}) {
    state.requests.filters = filters
  },
  SET_LOADING(state, loading) {
    state.requests.loading = loading
  }
}

export const actions = {
  async FETCH_LIST({ commit, state, rootGetters }, payload = {}) {
    commit('SET_LOADING', true)

    try {
      payload = {
        limit: state.requests.limit,
        offset: state.requests.offset,
        carrierGuid: rootGetters['accreditations/DEFAULT_CARRIER_GUID'],
        ordererGuid: rootGetters['accreditations/DEFAULT_ORDERER_GUID'],
        ...state.requests.filters,
        ...payload
      }

      const {
        status,
        count,
        requests
      } = await this.$api.accreditations.getRequests(payload)

      if (status) {
        if (state.requests.offset === 0) {
          await commit('SET_LIST', requests)
        } else {
          await commit('SET_LIST', [...state.requests.list, ...requests])
        }
        await commit('SET_COUNT', count)
      }
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)
  }
}
