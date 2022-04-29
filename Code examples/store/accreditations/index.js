/* eslint-disable no-undef */
import * as notify from '@/utils/notify'

export const state = () => ({
  counterparties: {
    list: [],
    count: 0,
    selected: null,
    loading: false
  }
})

export const mutations = {
  SET_LIST(state, list) {
    state.counterparties.list = list
  },
  SET_COUNT(state, count) {
    state.counterparties.count = count
  },
  SET_SELECTED(state, selected) {
    state.counterparties.selected = selected
  },
  SET_LOADING(state, loading) {
    state.counterparties.loading = loading
  }
}

export const getters = {
  DEFAULT_CARRIER_GUID: (state) =>
    state.counterparties.selected
      ? state.counterparties.selected.carrier.guid
      : null,
  DEFAULT_ORDERER_GUID: (state) =>
    state.counterparties.selected
      ? state.counterparties.selected.orderer.guid
      : null
}

export const actions = {
  async FETCH_LIST({ rootState, commit }, payload = {}) {
    commit('SET_LOADING', true)

    try {
      payload = {
        ...payload,
        companyGuid: rootState.companies.currentCompany.guid
      }

      const {
        status,
        count,
        counterparties
      } = await this.$api.accreditations.getCounterparties(payload)

      await commit('SET_SELECTED', null)
      await commit('SET_LIST', status ? counterparties : [])
      await commit('SET_COUNT', status ? count : 0)
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)
  },

  async FETCH_LIST_ITEM({ commit }, guid) {
    commit('SET_LOADING', true)

    let result = {}

    try {
      result = await this.$api.accreditations.getCounterparties({ guid })
      await commit(
        'SET_SELECTED',
        result.status ? result.counterparties[0] : null
      )
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)

    return result.status
  },

  async CREATE({ commit, state, dispatch }, payload = {}) {
    commit('SET_LOADING', true)

    try {
      const { status, item } = await this.$api.accreditations.createStates(
        payload
      )

      if (status) {
        await dispatch('FETCH_LIST')
        await commit('SET_SELECTED', state.counterparties.list[0])

        notify.success({
          text: $nuxt.$t(`forms.common.accreditationCreated`),
          buttons: [
            {
              text: $nuxt.$t('forms.common.review'),
              handler: () =>
                $nuxt.$router.push({
                  name: 'LANG-workspace-accreditation-guid',
                  params: {
                    guid: `${item.organistion_guid}--${item.carrier_organistion_guid}`
                  }
                })
            }
          ]
        })
      }
    } catch ({ message }) {
      notify.error({ text: message })
    }

    commit('SET_LOADING', false)
  }
}
