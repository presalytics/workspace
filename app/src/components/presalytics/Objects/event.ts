import EventType from './event-type'
import { ResourceType } from './resource-type'

export default class Event {
  id: String
  resourceId: String
  userId: String
  type: String
  eventType: EventType
  data: Object
  time: Date
  resourceType: ResourceType 
  eventSubType: String
  source: String
  subject: String

  constructor(obj: any) {
    this.id = obj.id
    this.resourceId = obj.data.resourceId
    this.userId = obj.data.userId
    this.type = obj.type
    this.eventType = new EventType(obj.type)
    this.data = obj.data
    this.time = obj.time instanceof Date ? obj.time : new Date(obj.time)
    this.resourceType = obj.type.split('.')[0]
    this.eventSubType = obj.type.split('.')[1]
    this.source = obj.source
    this.subject = obj.subject
  }
}