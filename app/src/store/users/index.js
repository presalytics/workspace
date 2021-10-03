import Worker from './users.worker?worker'
import {create} from 'jsondiffpatch'
// import DummyWorker from './dummyworker.js?worker'

// const dummy = new DummyWorker();
// console.log(dummy) // eslint-disable-line

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
    userDb: (state) => {
      return state.userList
    },
    getUser: (state) => (userId) => {
      return state.users[userId]
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
    table: (state) => {
      return state.table
    },
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
    async initUsers ({ state }) {
      workerActions.postMessage({
        request: 'initUsers',
        users: state.users,
      })
    },
    async setToken (context, accessToken) {
      workerActions.postMessage({
        request: 'accessToken',
        accessToken: accessToken,
      })
    },
    initTable ({ commit }, columnList) {
      commit('INIT_TABLE', columnList)
    },
  },
}

export {workerActions as userWorker, users}