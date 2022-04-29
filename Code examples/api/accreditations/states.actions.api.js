import { getUserJWToken } from '@/utils/user'

const URL = 'transithub/accreditations/states/actions'

const formatStatestActions = (action, locale) => ({
  code: action.code,
  name: action.name_ua ? action[`name_${locale}`] : '',

  disabled: action.disabled,
  disabledText: action.disabled_text_ua
    ? action[`disabled_text_${locale}`]
    : undefined
})

export const getStatesActions = async function ({ statesGuids = [] }) {
  const isArgumentsValid = [
    Array.isArray(statesGuids) &&
      statesGuids.length > 0 &&
      statesGuids.every((guid) => guid.pIsGuid())
  ].every(Boolean)

  if (!isArgumentsValid) {
    throw new Error('Function arguments validation error')
  }

  const { status, items: actions } = await this.$axios.$get(URL, {
    params: {
      access_token: getUserJWToken(this),
      state_guids: statesGuids.join(';')
    }
  })

  if (status) {
    const locale = this.store.state.locale
    return {
      status,
      actions: actions.map((action) => formatStatestActions(action, locale))
    }
  }

  return { status }
}
