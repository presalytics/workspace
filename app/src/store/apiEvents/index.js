import { allowedSearchParams } from './apiEvents.worker'
import Worker from './apiEvents.worker?worker'
import { CloudEvent } from 'cloudevents'
import Event from '@/objects/event'

const workerActions = new Worker()

const initialState = () => {
  return {
    loading: false,
    tokenLoaded: false,
    events: [],
  }
}

const apiEvents = {
  namespaced: true,
  state: initialState,
  getters: {
    eventsDb: (state) => {
      if (state.events) return state.events.map( (evt) => new Event(evt)).sort( (a, b) => {
        let val = 0
        if (a.time > b.time) {
          val = -1
        } else {
          val = 1
        }
        return val
      })
      return []
    },
    eventIds: (state, getters) => getters.eventsDb.map( (evt) => evt.id),
    getByResourceId: (state, getters) => (resourceId) => {
      return getters.eventsDb.filter((cur) => cur.data.resourceId === resourceId)
    },
    getEventsByType: (state, getters) => (eventType) => {
      return getters.eventsDb.filter( (cur) => cur.type === eventType)
    },
    getStoryEvents: (state, getters) => (storyId) => getters.getByResourceId(storyId)
  },
  mutations: {
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_TOKEN_LOADED (state, payload) {
      state.tokenLoaded = payload
    },
    ADD_EVENTS (state, payload) {
      if (state.events.includes(null)) {
        state.events = state.events.filter(Boolean)
      }
      state.events.filter(Boolean)
      var isInDb = (evt) => {
        return state.events.filter( (cur) => cur.id === evt.id).length > 0
      }
      if (Array.isArray(payload)) {
        var newEvents = payload.reduce((acc, cur) => {
          if (!(isInDb(cur))) {
            acc.push(cur)
          }
          return acc
        }, [])
        if (newEvents.length > 0) {
          state.events.push(...newEvents)
        }
      } else {
        if (!(isInDb(payload))) {
          state.events.push(payload)
        }
      }
    },
    RESET_STATE (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => { state[key] = initial[key] })
    },
  },
  actions: {
    async sync( {getters, dispatch} ) {
      await dispatch('awaitRestoredState', null, {root: true})
      workerActions.postMessage({
        request: 'workerSync',
        eventIds: getters.eventIds
      })
    },
    getStoryEvents ( context, storyId) {
      workerActions.postMessage({ request: 'getStoryEvents', storyId: storyId })
    },
    async initEvents ( { dispatch }, userId) {
      await dispatch('sync')
      workerActions.postMessage({ request: 'initEvents', userId: userId })
    },
    sendEvent (context, eventData) {
      if (eventData instanceof CloudEvent) {
        workerActions.postMessage({request: 'sendEvent', eventData: eventData.toJSON()})
      } else {
        throw new Error('eventData must be of type CloudEvent.  See https://github.com/cloudevents/sdk-javascript')
      }
    },
    search (context, query) {
      // ALLOWED query parameters: resourceId, userId, id, minTimeStamp, maxTimestamp, type 
      Object.keys(query).forEach( (key) => {
        if (!allowedSearchParams.includes(key)) {
          throw new Error('Invalid event search parameter: ' + key)
        }
      })
      workerActions.postMessage({
        request: 'search',
        query: query
      })
    }
  },
}

export {workerActions as eventWorker, apiEvents}