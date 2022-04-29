import Vue from 'vue'

import NotificationComponent from '@/components/Base/Notification/Notification'

const NotificationConstructor = Vue.extend(NotificationComponent)

// header + margin
const baseVerticalOffset = 60 + 16
let instances = []

class Notification {
  constructor(propsData) {
    this.userOnClose = propsData.onClose
    this.instance = new NotificationConstructor({ propsData })

    this.mount()

    return this.instance
  }

  mount() {
    this.instance.onClose = (id) => this.close(id, this.userOnClose)
    this.instance.verticalOffset = this.defineVerticalOffset()

    this.instance.$mount()

    instances.push(this.instance)

    document.body.appendChild(this.instance.$el)
  }

  defineVerticalOffset() {
    let verticalOffset = baseVerticalOffset

    instances.forEach((instance) => {
      verticalOffset += instance.$el.offsetHeight + 16
    })

    return verticalOffset
  }

  close(id, userOnClose) {
    const removedInstance = instances.filter(
      (instance) => instance._uid === id
    )[0]

    if (!removedInstance) return

    if (userOnClose && typeof userOnClose === 'function') {
      userOnClose()
    }

    const removedInstanceIndex = instances.findIndex(
      (instance) => instance._uid === id
    )

    const instancesToUpdate = instances.slice(removedInstanceIndex + 1)

    instances = instances.filter((instance) => instance._uid !== id)

    const removedHeight = removedInstance.$el.offsetHeight

    instancesToUpdate.forEach(
      (instance) => (instance.verticalOffset -= removedHeight + 16)
    )
  }
}

export default Notification
