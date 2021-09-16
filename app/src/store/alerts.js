const initialState = () => ({
  type: null,
  message: null,
  active: false,
  timeout: -1,
  defaultTimeout: -1,
})

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    SET_ALERT (state, payload) {
      if (payload.message) {
        state.type = payload.type || 'error'
        state.message = payload.message || ''
        state.timeout = payload.timeout || state.defaultTimeout
      }
    },
    DISMISS_ALERT (state) {
      state.type = 'error'
      state.message = ''
      state.timeout = state.defaultTimeout
    },
    RESET_STATE (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => { state[key] = initial[key] })
    },
  },
  actions: {
    setAlert ({ commit }, payload) {
      commit('SET_ALERT', payload)
    },
  },
}
