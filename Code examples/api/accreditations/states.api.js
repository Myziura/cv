import { getUserJWToken } from '@/utils/user'
import { PAGE_SIZE } from '@/utils/defaultValues'
import { PROCESSING_STATUSES } from '@/utils/accreditation'

const URL = '/transithub/accreditations/states'

const TABLE_TYPES = Object.freeze({
  VEHICLES: 'th_vehicles'
})

const formatState = (state) => ({
  guid: state.guid,
  processingStatus: {
    key: PROCESSING_STATUSES.KEYS[state.processing_status],
    translationKey:
      PROCESSING_STATUSES.TRANSLATION_KEYS[state.processing_status],
    color: PROCESSING_STATUSES.COLORS[state.processing_status]
  },

  isHasAtLeastOneDocument: state.has_documents,

  vehicleGuid: state.vehicle_guid || '',
  vehicleNumber: state.vehicle_number || '',
  requestsCount: state.requests_count || '',

  createdDate: state.created_at,
  processingDate: state.last_processing_date
})

export const getStates = async function ({
  limit = PAGE_SIZE,
  offset = 0,
  carrierGuid,
  ordererGuid,
  vehicleNumber = null
}) {
  const isArgumentsValid = [
    limit.pIsLimit(),
    offset.pIsOffset(),
    carrierGuid.pIsGuid(),
    ordererGuid.pIsGuid()
  ].every(Boolean)

  if (!isArgumentsValid) {
    throw new Error('Function arguments validation error')
  }

  const { status, count, items: states } = await this.$axios.$get(URL, {
    params: {
      access_token: getUserJWToken(this),
      limit,
      offset,
      carrier_organization: carrierGuid,
      organization: ordererGuid,
      vehicle_number: vehicleNumber
    }
  })

  if (status) {
    return { status, count, states: states.map(formatState) }
  }

  return { status }
}

export const createStates = async function ({
  carrierGuid,
  ordererGuid,
  vehicles = [],
  tableType = TABLE_TYPES.VEHICLES
}) {
  const isArgumentsValid = [
    carrierGuid.pIsGuid(),
    ordererGuid.pIsGuid(),
    Array.isArray(vehicles) && vehicles.length > 0,
    typeof tableType === 'string' &&
      Object.values(TABLE_TYPES).includes(tableType)
  ].every(Boolean)

  if (!isArgumentsValid) {
    throw new Error('Function arguments validation error')
  }

  const { status, ...item } = await this.$axios.$post(
    URL,
    {
      table_type: tableType,
      th_carrier_organisation_guid: carrierGuid,
      th_organisation_guid: ordererGuid,
      vehicles
    },
    {
      params: {
        access_token: getUserJWToken(this)
      }
    }
  )

  return { status, item }
}

export const updateStates = async function ({
  statesGuids = [],
  processingStatus
}) {
  const isArgumentsValid = [
    Array.isArray(statesGuids) &&
      statesGuids.length > 0 &&
      statesGuids.every((guid) => guid.pIsGuid()),
    typeof processingStatus === 'string' &&
      Object.values(PROCESSING_STATUSES.KEYS).includes(processingStatus)
  ].every(Boolean)

  if (!isArgumentsValid) {
    throw new Error('Function arguments validation error')
  }

  const { status } = await this.$axios.$put(
    URL,
    {
      items: statesGuids
    },
    {
      params: {
        access_token: getUserJWToken(this),
        processing_status: processingStatus
      }
    }
  )

  return status
}

export const deleteStates = async function ({ statesGuids = [] }) {
  const isArgumentsValid = [
    Array.isArray(statesGuids) &&
      statesGuids.length > 0 &&
      statesGuids.every((guid) => guid.pIsGuid())
  ].every(Boolean)

  if (!isArgumentsValid) {
    throw new Error('Function arguments validation error')
  }

  const { status } = await this.$axios.$delete(URL, {
    params: {
      guid: statesGuids.join(';'),
      access_token: getUserJWToken(this)
    }
  })

  return status
}
