/* eslint-disable no-undef */

import config from '@/config/general'
import Notification from '@/utils/notify/class'

const supportLink = 'https://app.purechat.com/w/th-support'

/*
  Options:

  [name]:                       [type]   | [default]

  title:                        String   | Defines based on type,
  text:                         String   | "Підтвердити дію?",
  isInfinite                    Boolean  | false
  duration                      Number   | config.ui.messages.duration
  buttons                       Array    | []
  onClose                       Function | -
*/

const notify = (options) => {
  if (options.type === 'error') {
    console.error(options.title || '', options.text || '')
    console.trace()
  }

  try {
    const notification = new Notification(options)
    return notification
  } catch {}
}

export const success = (options) => notify({ type: 'success', ...options })
export const warning = (options) => notify({ type: 'warning', ...options })
export const info = (options) => notify({ type: 'info', ...options })
export const error = (options) => notify({ type: 'error', ...options })
export const support = ({ text } = {}) =>
  notify({
    type: 'error',
    title: `${$nuxt.$t(`messages.systemError`)}!`,
    text: text
      ? `${text}. ${$nuxt.$t(`messages.contactSupport`)}`
      : $nuxt.$t(`messages.contactSupport`),
    duration: config.ui.messages.duration * 2,
    buttons: [
      {
        text: $nuxt.$t(`forms.driverWorkspace.support`),
        handler: () => window.open(supportLink, '_blank')
      }
    ]
  })
