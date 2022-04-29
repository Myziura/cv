import { getUserJWToken } from '@/utils/user'

const URL = '/transithub/accreditations/vehicles'

const formatVehicle = (vehicle) => ({
  guid: vehicle.guid,
  brand: vehicle.brand || '',
  isTrailer: vehicle.is_trailer,
  number: vehicle.state_number || '',
  techPassport: vehicle.tech_passport || ''
})

export const getVehicles = async function ({
  limit = 10000,
  offset = 0,
  carrierGuid,
  ordererGuid,
  vehicleNumber = '',
  hasAccreditationState = false
}) {
  const isArgumentsValid = [
    limit.pIsLimit(),
    offset.pIsOffset(),
    carrierGuid.pIsGuid(),
    ordererGuid.pIsGuid(),
    typeof hasAccreditationState === 'boolean'
  ].every(Boolean)

  if (!isArgumentsValid) {
    throw new Error('Function arguments validation error')
  }

  const { status, count, items: vehicles } = await this.$axios.$get(URL, {
    params: {
      access_token: getUserJWToken(this),
      limit,
      offset,
      has_accreditation_state: hasAccreditationState ? 1 : 0,
      vehicle_number: vehicleNumber,
      carrier_organization: carrierGuid,
      organization: ordererGuid
    }
  })

  if (status) {
    return { status, count, vehicles: vehicles.map(formatVehicle) }
  }

  return { status }
}
