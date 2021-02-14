export default {
  state: () => ({
    accessToken: null,
    user: null,
  }),
  mutations: {
    SET_AUTH (state, payload) {
      state.user = payload.user
      state.accessToken = payload.token
    },
    DELETE_AUTH (state) {
      state.user = null
      state.accessToken = null
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
