const initialState = () => ({
  accessToken: null,
  user: null,
})

export default {
  namespaced: true,
  state: initialState,
  getters: {
    userId (state) {
      return state.user['https://api.presalytics.io/api_user_id']
    },
  },
  mutations: {
    SET_AUTH (state, payload) {
      state.user = payload.user
      state.accessToken = payload.token
    },
    DELETE_AUTH (state) {
      state.user = null
      state.accessToken = null
    },
    RESET_STATE (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => { state[key] = initial[key] })
    },
  },
  actions: {
    setAuthorization ({ commit }, payload) {
      commit('SET_AUTH', payload)
    },
    deleteAuthorization ({ commit }) {
      commit('DELETE_AUTH')
    },
  },
}
