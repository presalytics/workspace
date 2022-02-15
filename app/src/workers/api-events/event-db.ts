import ApiEvent from '@/objects/api-event'
import Dexie from 'dexie'

export default class EventDb extends Dexie{
  events!: Dexie.Table<ApiEvent, number>

  constructor(){
    super("events")
    this.version(1).stores({
      events: '&id, type, data, data.resourceId, data.userId, time'
    })
    this.events.mapToClass(ApiEvent)
  }
}
