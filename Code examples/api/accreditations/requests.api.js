import { getUserJWToken } from '@/utils/user'
import { PAGE_SIZE } from '@/utils/defaultValues'
import {
  // REQUESTS_STATUSES as STATUSES,
  REQUESTS_KINDS as KINDS,
  PROCESSING_STATUSES
} from '@/utils/accreditation'

const URL = '/transithub/accreditations/requests'

const formatRequest = (request) => ({
  guid: request.guid,

  vehicleNumber: request.vehicle_number || '',
  comments: request.comments || '',

  kind: {
    key: KINDS.KEYS[request.kind],
    translationKey: KINDS.TRANSLATION_KEYS[request.kind],
    color: KINDS.COLORS[request.kind]
  },

  // status: {
  //   key: STATUSES.KEYS[request.status],
  //   translationKey: STATUSES.TRANSLATION_KEYS[request.status]
  // },
  processingStatus: {
    key: PROCESSING_STATUSES.KEYS[request.processing_status],
    translationKey:
      PROCESSING_STATUSES.TRANSLATION_KEYS[request.processing_status]
  },

  createdDate: request.created_at,
  processingDate: request.processing_date
})

export const getRequests = async function ({
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

  const { status, count, items: requests } = await this.$axios.$get(URL, {
    params: {
      access_token: getUserJWToken(this),
      limit,
      offset,
      carrier_organization: carrierGuid,
      organization: ordererGuid,
      vehicle: vehicleNumber
    }
  })

  if (status) {
    return { status, count, requests: requests.map(formatRequest) }
  }

  return { status }
}
