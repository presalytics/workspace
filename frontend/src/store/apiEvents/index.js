import Vue from '../../main'
import Worker from './apiEvents.worker'
import Cookies from 'js-cookie'

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
      return state.events || []
    },
    getStoryEvents: (state, getters) => (storyId) => {
      return getters.eventsDb.filter((cur) => cur.resourceId === storyId)
    },
  },
  mutations: {
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_TOKEN_LOADED (state, payload) {
      state.tokenLoaded = payload
    },
    ADD_EVENTS (state, payload) {
      var isInDb = (evt) => {
        return state.events.filter((cur) => cur.id === evt.id).length > 0
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
    setToken ({ state }, accessToken) {
      workerActions.postMessage({
        request: 'accessToken',
        accessToken: accessToken,
        csrf: Cookies.get('csrftoken'),
      })
    },
    async getStoryEvents ({ commit }, storyId) {
      workerActions.postMessage({ request: 'getStoryEvents', storyId: storyId })
    },
  },
}

workerActions.onmessage = e => {
  const vm = Vue
  if (e.data.type === 'REFRESH_AUTH') {
    vm.$auth.getTokenSilently()
  } else {
    vm.$store.commit('apiEvents/' + e.data.type, e.data.payload)
  }
}

export default apiEvents
