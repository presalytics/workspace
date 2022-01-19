import Vue from 'vue'
import Vuex, {createLogger} from 'vuex'
import VuexPersistence from 'vuex-persist'
import localforage from 'localforage'
// import SecureLS from 'secure-ls'
import auth from './auth'
import {stories, storyWorker} from './stories'
import {users, userWorker} from './users'
import {apiEvents, eventWorker} from './apiEvents'
import {images, imageWorker} from './images'
import alerts from './alerts'
import dialogs from './dialogs'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  key: 'vuex-local',
  storage: localforage,
  asyncStorage: true,
})

const initialState = () => ({
  barColor: 'rgba(0, 0, 0, .8), rgba(0, 0, 0, .8)',
  barImage: 'https://demos.creative-tim.com/material-dashboard/assets/img/sidebar-1.jpg',
  drawer: null,
  resetting: false,
  isVisible: true
})

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
    },
    async logout ({ dispatch }) {
      dispatch('reset')
      dispatch('auth/deleteAuthorization')
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
    }
  },
  modules: {
    auth,
    stories,
    users,
    apiEvents,
    alerts,
    dialogs,
    images
  },
  plugins: import.meta.env.DEV ? [createLogger(), vuexLocal.plugin] : [vuexLocal.plugin]
})