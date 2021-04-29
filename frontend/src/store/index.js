import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
// import SecureLS from 'secure-ls'
import auth from './auth'
import stories from './stories'
import users from './users'
import apiEvents from './apiEvents'
import alerts from './alerts'
import dialogs from './dialogs'

Vue.use(Vuex)

// const ls = new SecureLS({ encodingType: 'AES', encryptionSecret: process.env.VUE_APP_ENCRYPTION_KEY || 'debug-enc-key' })

// const vuexSecure = new VuexPersistence({
//   key: 'vuex',
//   saveState: (key, state, storage) => {
//     ls.set(key, state)
//   },
//   restoreState: (key, storage) => {
//     return ls.get(key)
//   },
// })

const vuexLocal = new VuexPersistence({
  key: 'vuex-local',
  storage: window.localStorage,
})

var resetting = false

const initialState = () => ({
  barColor: 'rgba(0, 0, 0, .8), rgba(0, 0, 0, .8)',
  barImage: 'https://demos.creative-tim.com/material-dashboard/assets/img/sidebar-1.jpg',
  drawer: null,
  resetting: false,
})

const store = new Vuex.Store({
  state: initialState,
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
  },
  mutations: {
    SET_BAR_IMAGE (state, payload) {
      state.barImage = payload
    },
    SET_DRAWER (state, payload) {
      state.drawer = payload
    },
    RESET_STATE (state) {
      state = initialState
      resetting = true
    },
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
  },
  modules: {
    auth,
    stories,
    users,
    apiEvents,
    alerts,
    dialogs,
  },
  plugins: [vuexLocal.plugin],
})

const vm = new Vue()

store.watch(() => store.getters.accessToken, (newValue) => {
  if (newValue?.length > 1) {
    store.dispatch('sendToken', newValue)
  } else {
    if (resetting) {
      resetting = false
    } else {
      vm.$auth.getTokenSilently()
    }
  }
})

store.watch(() => store.getters.userId, (newValue) => {
  if (newValue) {
    store.dispatch('stories/initStories')
    store.dispatch('apiEvents/initEvents')
    store.dispatch('users/initUsers')
  }
})

export default store
