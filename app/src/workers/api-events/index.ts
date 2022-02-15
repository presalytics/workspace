/* eslint-disable @typescript-eslint/ban-ts-comment */
import HttpPlugin from '@/plugins/http'
import SignalRConnectionManager from './hub-connection'
import EventQuery, { EventQueryParameters } from '@/objects/api-event/event-query'
import ApiEvent from '@/objects/api-event'
import EventData from '@/objects/api-event/event-data'
import { CloudEvent } from 'cloudevents'
import { ApiEventWorkerMessage, ApiEventWorkerResponseType } from '@/objects/api-event/api-event-worker-message'
import EventDb from './event-db'

const db = new EventDb()

const http = new HttpPlugin({ worker: self })

interface IWhereClause {
  id: string | undefined
  "data.resourceId": string | undefined
  "data.userId": string | undefined
}

class EventManager {
  worker : DedicatedWorkerGlobalScope
  constructor(worker: DedicatedWorkerGlobalScope) {
    this.worker = worker
  }

  queryStringify (obj: EventQueryParameters) {
    const str = []
    for (const p in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, p)) {
        // @ts-ignore
        if (obj[p] !== null) {
          //@ts-ignore
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        }
      }
    }
    return str.join('&')
  }

  async getEventsFromApi (query: EventQueryParameters) {
    let moreEvts = true
    let page = 1
    const eventsList = []
    while (moreEvts) {
      let evts = await http.getData('/api/event-store/?page=' + page + '&' + this.queryStringify(query))
      if (!Array.isArray(evts)) {
        evts = evts.$values
      }
      if (evts.length > 0) eventsList.push(...evts) 
      if (evts.length !== 100) {
        moreEvts = false
      } else {
        page += 1
        evts = null
      }
    }
    return eventsList
  }

  async getEventsFromDb(eventQuery: EventQuery) {
    // ALLOWED query parameters: resourceId, userId, id, minTimeStamp, maxTimestamp, type
    const whereClause = {} as IWhereClause
    if (eventQuery.queryParameters.resourceId) {
      whereClause['data.resourceId'] = eventQuery.queryParameters.resourceId
    }
      if (eventQuery.queryParameters.userId) {
      whereClause['data.userId'] = eventQuery.queryParameters.userId
    }
    if (eventQuery.queryParameters.id) whereClause.id = eventQuery.queryParameters.id
    let collection = Object.keys(whereClause).length === 0 ? db.events.toCollection() : db.events.where(whereClause)
    if (eventQuery.limit) {
      collection = collection.limit(eventQuery.limit)
    }
    if (eventQuery.queryParameters.minTimestamp || eventQuery.queryParameters.maxTimestamp || eventQuery.queryParameters.type) {
      collection = collection.filter( (entry) => {
        let testCondition = true
        if (eventQuery.queryParameters.minTimestamp) {
          const minDate = new Date(eventQuery.queryParameters.minTimestamp)
          testCondition = entry.time > minDate
        }
        if (eventQuery.queryParameters.maxTimestamp && testCondition) {
          const maxDate = new Date(eventQuery.queryParameters.maxTimestamp)
          testCondition = entry.time < maxDate
        }
        if (eventQuery.queryParameters.type && testCondition) {
          testCondition = entry.type.includes(eventQuery.queryParameters.type)
        }
        return testCondition
      })
    }
    const results = await collection.sortBy('time')
    return results.reverse()
  }

  async addEventsToDb(evts: Array<ApiEvent> | ApiEvent) {
    if (!Array.isArray(evts)) {
      evts = [evts]
    }
    let newEvents = [] as Array<ApiEvent>
    if (evts.length > 0) {
      const eventIds = evts.map( (cur) => cur.id)
      const dbEvents = await db.events.where('id').anyOf(eventIds).toArray()
      const alreadyInDb = dbEvents.map( (cur) => cur.id)
      newEvents = evts.filter( (cur) => !alreadyInDb.includes(cur.id))
      await db.events.bulkAdd(newEvents)
    }
    return newEvents
  }

  removeModelFromEvent(evt: ApiEvent) {
    if (evt.data?.model) {
      delete evt.data.model
    }
    return evt
  }

  async getEvents(eventQuery: EventQuery): Promise<void> {
    const evts = await this.getEventsFromDb(eventQuery)
    this.postEvents(evts, eventQuery)
    const apiEvts = await this.getEventsFromApi(eventQuery.queryParameters)
    const newEvtIds = await this.addEventsToDb(apiEvts)
    if (newEvtIds.length > 0) {
      const newEvts = apiEvts.filter( (cur) => newEvtIds.includes(cur.id))
      this.postEvents(newEvts, eventQuery)
    }
  }

  postEvents(evts: Array<ApiEvent> | ApiEvent, eventQuery?: EventQuery): void {
    if (!Array.isArray(evts)) {
      evts = [evts]
    }
    const message = {} as ApiEventWorkerMessage
    message.events = evts
    if (typeof eventQuery !== 'undefined') {
      if (!eventQuery.returnModel) {
        message.events = message.events.map( (evt: ApiEvent) => this.removeModelFromEvent(evt))
      }
      message.type = ApiEventWorkerResponseType.QueryResult
      message.query = eventQuery
    } else {
      message.type = ApiEventWorkerResponseType.NewEvent
      message.query = null
    }
    this.worker.postMessage(message)

  }  

  // @ts-ignore
  handleInboundMessage(message) {
    const key = message.request || message.type
    switch (key) {
      case ('sendEvent'): {
        eventClient.sendEvent(message.eventData)
        break
      }
      case ('search'): {
        this.getEvents(EventQuery.fromJSON(message.query))
        break
      }
    }
  }

  async handleInboundEvent(evt: ApiEvent) {
    const newEvents = await this.addEventsToDb(evt)
    this.postEvents(newEvents)
  }

}

const mgr = new EventManager(self as DedicatedWorkerGlobalScope)

self.addEventListener('message', async (e) => {
  try {
    mgr.handleInboundMessage(e.data)
  } catch(err) {
    console.error(err)  // eslint-disable-line
  }
})

const eventClient = new SignalRConnectionManager({
  inboundEventHandler: (evt: CloudEvent<EventData>) => {
    mgr.handleInboundEvent(new ApiEvent(evt))
  },
  accessTokenFn: http.accessTokenCallback.bind(http)
})

eventClient.startConnection()
