import { CloudEvent } from 'cloudevents'
import { v4 as uuidv4 } from 'uuid'

let instance = null

// eslint-disable-next-line no-unused-vars
export default class Dispatcher {  
  constructor(storeDispatchFn, userIdFn) {
    this.registry = []
    this.dispatch = storeDispatchFn
    this.getUserId = userIdFn
    this.defaults().map( (cur) => this.subscribe(cur))
  }

  static install(Vue, options = {}) {
    if (instance) {
      return instance
    } else {
      instance = new Dispatcher(
        options.storeDispatchFn,
        options.userIdFn
      )
    }
    Vue.prototype.$dispatcher = instance
  }

  handleEvent(eventData) {
    const eventType = eventData.type
    this.registry
          .filter( (cur) => cur.type == eventType)
          .map( (cur) => this.dispatch(cur.action, eventData))
  }

  subscribe(eventType, actionName) {
    this.registry.push[{
      type: eventType,
      action: actionName
    }]
  }

  // component level api actions... must be unsubscribed on component beforeDistroy() if operation should not continue
  unsubscribe(eventType, actionName) {
    let record = this.registry.filter( (cur) => cur.type == eventType && cur.action == actionName)
    if (record) {
      const index = this.registry.indexOf(record)
      this.registry.splice(index, 1)
    }
  }

  // global api actions... always on
  defaults() {
    return [
      {
        type: "story.created",
        action: "stories/addStory"
      },
      {
        type: "story.deleted",
        action: "stories/deleteStory"
      }
    ]
  }

  emit(type, model, options = {}) {
    const evt = new CloudEvent({
      type: type,
      data: {
        resourceId: model.id || model.Id || model.ID || model.pk,
        userId: this.getUserId(),
        model: model
      },
      subject: options.title || options.name || model.title || model.name || model.id || model.Id || model.ID || model.pk,
      time: new Date().toISOString(),
      id: uuidv4(),
      source: window.location.origin,
      datacontenttype: "application/json"
    })
    this.dispatch('apiEvents/sendEvent', evt)
  }
}