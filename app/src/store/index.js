import Vue from 'vue'
import Vuex, {createLogger} from 'vuex'
import VuexPersistence from 'vuex-persist'
import localforage from 'localforage'
import { debounce } from 'lodash-es'
import deepmerge from 'deepmerge'
import auth from './auth'
import {stories, storyWorker} from './stories'
import {users, userWorker} from './users'
import {apiEvents, eventWorker} from './apiEvents'
import {images, imageWorker} from './images'
import alerts from './alerts'
import dialogs from './dialogs'
import storyviewer from './storyviewer'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  key: 'vuex-local',
  storage: localforage,
  asyncStorage: true,
  saveState: async (key, state, storage) => {
    let fn = debounce(
      async() => {
        await storage.setItem(key, deepmerge({}, state || {}))
      }, 
      250, 
      {leading: true, trailing: true, maxWait: 750}
    )
    await fn()
  }
})

const initialState = () => ({
  drawer: null,
  resetting: false,
  isVisible: true
})

const sleep = async (ms) => await new Promise(resolve => setTimeout(resolve, ms));

export {userWorker, eventWorker, storyWorker, imageWorker}

export default new Vuex.Store({
  state: initialState,
  strict: true,
  getters: {
    accessToken: (state) => {
      return state.auth.accessToken
    },
    me: (state) => {
      if (state.auth?.user) {
        return state.auth.user
      } else {
        return null
      }
    },
    userId: (state, getters) => {
      if (getters.me) {
        return getters.me['https://api.presalytics.io/api_user_id']
      } else {
        return ''
      }
    },
    visibility: (state) => state.isVisible
  },
  mutations: {
    SET_BAR_IMAGE (state, payload) {
      state.barImage = payload
    },
    SET_DRAWER (state, payload) {
      state.drawer = payload
    },
    RESET_STATE (state) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state = initialState  // eslint-disable-line no-unused-vars 
    },
    SET_VISIBILITY (state, payload) {
      state.isVisible = payload
    }
  },
  actions: {
    sendToken ({ dispatch }, token) {
      dispatch('apiEvents/setToken', token)
      dispatch('stories/setToken', token)
      dispatch('users/setToken', token)
    },
    reset ({ commit }) {
      commit('RESET_STATE')
      commit('auth/RESET_STATE')
      commit('apiEvents/RESET_STATE')
      commit('stories/RESET_STATE')
      commit('users/RESET_STATE')
      commit('storyviewer/RESET_STATE')
    },
    async logout ({ dispatch }) {
      dispatch('reset')
      dispatch('auth/deleteAuthorization')
      await sleep(1000)
      await this.restored
    },
    checkLogin ({ getters}, userId) {
      if (getters.userId !== userId) {
        this._vm.$dispatcher.emit("user.login", {id: userId, userId: userId})
      }
    },
    setVisibility ({ commit }, newValue) {
      commit('SET_VISIBILITY', newValue)
    },
    async awaitRestoredState() {
      await this.restored
    },
    localEvent(context, evt) {
      this._vm.$dispatcher.localEventBus.$emit(evt.type, evt.payload)
    }
  },
  modules: {
    auth,
    stories,
    users,
    apiEvents,
    alerts,
    dialogs,
    images,
    storyviewer,
  },
  plugins: import.meta.env.DEV ? [createLogger(), vuexLocal.plugin] : [vuexLocal.plugin]
})