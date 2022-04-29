import * as counterparties from '@/utils/api/accreditations/counterparties.api'
import * as states from '@/utils/api/accreditations/states.api'
import * as statesActions from '@/utils/api/accreditations/states.actions.api'
import * as requests from '@/utils/api/accreditations/requests.api'
import * as vehicles from '@/utils/api/accreditations/vehicles.api'

export default {
  ...counterparties,
  ...states,
  ...statesActions,
  ...requests,
  ...vehicles
}
