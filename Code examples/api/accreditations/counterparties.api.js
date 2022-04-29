import { getUserJWToken } from '@/utils/user'
import { PROCESSING_STATUSES } from '@/utils/accreditation'

const URL = '/transithub/accreditations'

const formatCounterparties = (item) => ({
  guid: item.guid,
  carrier: {
    name: item.carrier_organization_name,
    guid: item.carrier_organization_guid
  },
  orderer: {
    name: item.organization_name,
    guid: item.organization_guid
  },
  vehiclesAccreditated: item.vehicles_accreditated || 0
})

export const getCounterparties = async function ({
  guid = null,
  companyGuid = null,
  processingStatuses = []
}) {
  const isArgumentsValid = [
    !guid || (guid.split('--')[0].pIsGuid() && guid.split('--')[1].pIsGuid()),
    !companyGuid || companyGuid.pIsGuid(),
    processingStatuses.every((status) =>
      Object.values(PROCESSING_STATUSES).includes(status)
    )
  ].every(Boolean)

  if (!isArgumentsValid) {
    throw new Error('Function arguments validation error')
  }

  const { status, count, items: counterparties } = await this.$axios.$get(URL, {
    params: {
      access_token: getUserJWToken(this),
      guid,
      th_company_guid: companyGuid,
      processing_statuses: processingStatuses.join(';')
    }
  })

  if (status) {
    return {
      status,
      count,
      counterparties: counterparties.map(formatCounterparties)
    }
  }

  return { status }
}
