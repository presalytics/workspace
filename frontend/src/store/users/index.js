import Vue from '../../main'
import Worker from './users.worker'
import Cookies from 'js-cookie'
import remove from 'lodash/remove'

const workerActions = new Worker()

const initialState = () => {
  return {
    loading: false,
    tokenLoaded: false,
    users: [],
  }
}

const users = {
  namespaced: true,
  state: initialState,
  getters: {
    userDb: (state) => {
      return state.users || []
    },
    getUser: (state, getters) => (userId) => {
      var matches = getters.userDb.filter((cur) => cur.app_metadata.api_user_id === userId)
      return matches[0] || {}
    },
    search: (state, getters) => (searchText) => {
      return getters.userDb.filter((cur) => {
        var fullname = cur.given_name + ' ' + cur.family_name
        if (fullname.includes(searchText) || cur.email.includes(searchText) || cur.app_metadata.api_user_id === searchText || cur.nickname.includes(searchText)) {
          return true
        }
        return false
      })
    },
  },
  mutations: {
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_TOKEN_LOADED (state, payload) {
      state.tokenLoaded = payload
    },
    ADD_USER (state, payload) {
      remove(state.users, (ele) => ele.app_metadata.api_user_id === payload.app_metadata.api_user_id)
      state.users.push(payload)
    },
    INIT_USERS (state, payload) {
      state.users = payload
    },
    RESET_STATE (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => { state[key] = initial[key] })
    },
  },
  actions: {
    async initUsers ({ commit, dispatch }) {
      workerActions.postMessage({ request: 'initUsers' })
    },
    async setToken ({ state }, accessToken) {
      workerActions.postMessage({
        request: 'accessToken',
        accessToken: accessToken,
        csrf: Cookies.get('csrftoken'),
      })
    },
  },
}

workerActions.onmessage = e => {
  const vm = Vue
  if (e.data.type === 'REFRESH_AUTH') {
    vm.$auth.getTokenSilently()
  } else {
    vm.$store.commit('users/' + e.data.type, e.data.payload)
  }
}

export default users
