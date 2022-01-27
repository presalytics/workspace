import { CloudEvent } from 'cloudevents'
import { strict as assert } from 'assert'
import moment from 'moment'
import EventType, { EventTypeName } from './event-type'
import EventData from './event-data'
import { ResourceType } from '../resource-type'
import User, { getUser } from '@/objects/user'
import store from '@/store'
import { IApiResource } from '../api-resource'

moment.locale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'seconds',
    ss: '%ss',
    m: 'a minute',
    mm: '%dm',
    h: 'an hour',
    hh: '%dh',
    d: 'a day',
    dd: '%dd',
    M: 'a month',
    MM: '%d Mo.',
    y: 'a year',
    yy: '%d Yr.',
  },
})

export default class Event {
  id: string
  resourceId: string
  userId: string
  type: string
  eventType: EventType | undefined
  data: EventData
  time: Date
  resourceType: ResourceType 
  eventSubType: string
  source: string
  subject: string | undefined

  constructor(obj: CloudEvent<EventData>) {  
    this.id = obj.id
    this.resourceId = obj.data?.resourceId as string
    this.userId = obj.data?.userId as string
    this.type = obj.type
    try {
      this.eventType = new EventType(obj.type as EventTypeName)
    } catch (err) {
      this.eventType = undefined
    }
    if (obj.data != null) {
      this.data = obj.data
    } else {
      throw new Error('Event data missing')
    }
    if (obj.time != null) {
      this.time = new Date(obj.time)
    } else {
      throw new Error('Event time is missing')
    }
    this.resourceType = obj.type.split('.')[0] as ResourceType
    this.eventSubType = obj.type.split('.')[1]
    this.source = obj.source
    this.subject = obj.subject
  }

  getDescription(): string {
    if (this.hasEventType()) {
      assert(this.eventType !== undefined)
      const template = new Function("return `" + this.eventType.descriptionTemplate + "`;")
      const templateVars = {
        user: this.getUser(),
        resource: this.getResource()
      }
      return template.call(templateVars)
    } else {
      throw new Error('Cannot use method "getDescription" on event if property "eventType" is undefined')
    }
  }

  getUser(): User {
    return getUser(this.userId)
  }

  getResource(): IApiResource {
    let resource: IApiResource
    switch (this.resourceType) {
      case ResourceType.Story: {
        resource = store.getters['stories/getStory'](this.resourceId) as IApiResource
        break
      }
      default: {
        throw new Error('ResourceType "' +  this.resourceType + '" is not yet implemented')
      }
    }
    return resource
  }

  getFriendlyTime(): string {
    return moment(this.time).fromNow()
  }

  hasEventType(): boolean {
    return this.eventType !== undefined
  }
}