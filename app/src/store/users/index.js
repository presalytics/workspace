import Worker from './users.worker?worker'
import {create} from 'jsondiffpatch'
import { cloneDeep } from 'lodash-es'
import User from '@/objects/user'

var jsondiffpatch = create({
  objectHash: function (obj) {
    return obj.id
  },
  cloneDiffValues: true,
})

const workerActions = new Worker({type: "module"})

const initialState = () => {
  return {
    loading: false,
    tokenLoaded: false,
    users: {},
    userList: [],
    table: {
      columns: [],
      timeWindow: 'month',
    },
  }
}

const users = {
  namespaced: true,
  state: initialState,
  getters: {
    userList: (state) => {
      return Object.keys(state.users)
    },
    userDb: (state) => state.users.map( (cur) => new User(cur)),
    getUser: (state, getters) => (userId) => {
      return getters.users[userId]
    },
    users: (state) => cloneDeep(state.users),
    search: (getters) => (searchText) => {
      return Object.values(getters.users).filter((cur) => {
        var fullname = getters.getFullname(cur.id)
        if (fullname.includes(searchText) || cur.email.includes(searchText) || cur.appMetadata.apiUserId === searchText || cur.nickname.includes(searchText)) {
          return true
        }
        return false
      })
    },
    table: (state) => {
      return state.table
    },
    getFriendlyName: (state, getters) => (userId) => {
      var usr = getters.getUser(userId)
      if (usr.givenName && usr.familyName) {
        return usr.givenName + " " + usr.familyName
      } else if (usr.nickname) {
        return usr.nickname
      } else {
        return usr.name
      }
    }
  },
  mutations: {
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_TOKEN_LOADED (state, payload) {
      state.tokenLoaded = payload
    },
    SET_USER (state, payload) {
      state.users[payload.id] = payload
      state.userList.push(payload.id)
    },
    PATCH_USER (state, payload) {
      jsondiffpatch.patch(state.users[payload.id], payload.delta)
    },
    RESET_STATE (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => { state[key] = initial[key] })
    },
    ADD_TABLE_COLUMNS (state, payload) {
      state.table.columns = payload
    },
    TOGGLE_TABLE_COLUMN (state, payload) {
      state.table.columns = state.table.columns.map((cur) => {
        if (cur.value === payload.value) {
          cur.show = !cur.show
        }
        return cur
      })
    },
    UPDATE_TABLE_WINDOW (state, payload) {
      state.table.timeWindow = payload.timeWindow
    },
  },
  actions: {
    async initUsers ({ dispatch }) {
      await dispatch('sync')
      workerActions.postMessage({
        request: 'initUsers',
      })
    },
    async sync( {getters, dispatch} ) {
      await dispatch('awaitRestoredState', null, {root: true})
      workerActions.postMessage({
        request: 'workerSync',
        currentUsers: getters.users
      })
    },
    async setToken (context, accessToken) {
      workerActions.postMessage({
        request: 'accessToken',
        accessToken: accessToken,
      })
    },
    updateUser(context, userId) {
      workerActions.postMessage({
        request: 'updateUser',
        userId: userId
      })
    },
    initTable ({ commit }, columnList) {
      commit('INIT_TABLE', columnList)
    },
  },
}


export {workerActions as userWorker, users}