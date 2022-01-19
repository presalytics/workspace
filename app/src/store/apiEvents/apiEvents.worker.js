import HttpPlugin from '@/plugins/http'
import SignalRConnectionManager from './hub-connection'
import Dexie from 'dexie'

const db = new Dexie('events')

db.version(1).stores({
  events: '&id, type, data, data.resourceId, data.userId, time'
})

const http = new HttpPlugin({ worker: self })
export const allowedSearchParams = ['resourceId', 'userId', 'id', 'minTimeStamp', 'maxTimestamp', 'type']

class EventManager {
  constructor(worker) {
    this.worker = worker
    this.eventIdsOnMainThread = []
  }

  queryStringify (obj) {
    var str = []
    for (var p in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    }
    return str.join('&')
  }

  async getEventsFromApi (query) {
    var moreEvts = true
    var page = 1
    var eventsList = []
    while (moreEvts) {
      query.page = page
      var evts = await http.getData('/api/event-store/?' + this.queryStringify(query))
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

  async getEventsFromDb(query) {
    // ALLOWED query parameters: resourceId, userId, id, minTimeStamp, maxTimestamp, type
    Object.keys(query).forEach( (key) => {
      if (!allowedSearchParams.includes(key)) {
        throw new Error('Invalid event search parameter: ' + key)
      }
    })
    var whereClause = {}
    if (query.resourceId) whereClause['data.resourceId']
    if (query.userId) {
      whereClause['data.userId'] = query.userId
    }
    if (query.id) whereClause.id = query.id
    var collection = Object.keys(whereClause).length === 0 ? db.events.toCollection() : db.events.where(whereClause)
    if (query.minTimestamp || query.maxTimestamp || query.type) {
      collection = collection.filter( (entry) => {
        var testCondition = true
        var eventDate = new Date(entry.timestamp)
        if (query.minTimestamp) {
          let minDate = new Date(query.minTimestamp)
          testCondition = eventDate > minDate
        }
        if (query.maxTimestamp && testCondition) {
          let maxDate = new Date(query.maxTimestamp)
          testCondition = eventDate < maxDate
        }
        if (query.type && testCondition) {
          testCondition = entry.type.includes(query.type)
        }
        return testCondition
      })
    }
    return collection.toArray()
  }

  async addEventsToDb(evts) {
    if (!Array.isArray(evts)) {
      evts = [evts]
    }
    var newEvents = []
    if (evts.length > 0) {
      var eventIds = evts.map( (cur) => cur.id)
      var dbEvents = await db.events.where('id').anyOf(eventIds).toArray()
      var alreadyInDb = dbEvents.map( (cur) => cur.id)
      newEvents = evts.filter( (cur) => !alreadyInDb.includes(cur.id))
      await db.events.bulkAdd(newEvents)
    }
    return newEvents
  }

  async getEvents(query) {
    var evts = await this.getEventsFromDb(query)
    this.postEvents(evts, false)
    var apiEvts = await this.getEventsFromApi(query)
    var newEvtIds = await this.addEventsToDb(apiEvts)
    var newEvts = apiEvts.filter( (cur) => newEvtIds.includes(cur.id))
    this.postEvents(newEvts, false)
  }

  postEvents(evts, dispatch = true) {
    if (!Array.isArray(evts)) {
      evts = [evts]
    }
    if (evts.length > 0) {
      var eventsToPost = evts.filter( (evt) => !this.eventIdsOnMainThread.includes(evt.id))
      if (eventsToPost.length > 0) {
        this.worker.postMessage({
          type: 'ADD_EVENTS',
          cloudEvents: eventsToPost,
          dispatch: dispatch
        })
        var addedEvtIds = eventsToPost.map( (evt) => evt.id)
        this.eventIdsOnMainThread.push(addedEvtIds)
      }
    }
  }  

  handleInboundMessage(message) {
    var key = message.request || message.type
    switch (key) {
      case ('getStoryEvents'): {
        var storyId = message.storyId
        this.getEvents({ 
          resourceId: storyId,
          type: 'story'
        })
        break
      }
      case ('initEvents'): {
        var userId = message.userId
        this.getEvents({ resourceId: userId})
        break
      }
      case ('sendEvent'): {
        eventClient.sendEvent(message.eventData)
        break
      }
      case ('search'): {
        this.getEvents(message.query)
        break
      }
      case ('workerSync'): {
        this.eventIdsOnMainThread = message.eventIds
        break
      }
    }
  }

  async handleInboundEvent(evt) {
    var newEvents = await this.addEventsToDb(evt)
    this.postEvents(newEvents, true)
  }

}

const mgr = new EventManager(self)

self.addEventListener('message', async (e) => {
  try {
    mgr.handleInboundMessage(e.data)
  } catch(err) {
    console.error(err)  // eslint-disable-line
  }
})

const eventClient = new SignalRConnectionManager({
  inboundEventHandler: (evt) => {
    mgr.handleInboundEvent(evt.toJSON())
  },
  accessTokenFn: http.accessTokenCallback.bind(http)
})

eventClient.startConnection()
