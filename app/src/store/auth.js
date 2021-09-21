const initialState = () => ({
  accessToken: null,
  user: null,
  loading: false,
  isAuthenticated: false
})

const auth = {
  namespaced: true,
  state: initialState,
  getters: {
    isLoading: (state) => state.loading,
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    accessToken: (state) => state.accessToken
  },
  mutations: {
    TOGGLE_LOADING (state) {
      state.loading = !state.loading
    },
    SET_AUTH (state, payload) {
      state.user = payload.user
      state.accessToken = payload.token
      state.isAuthenticated = true
    },
    DELETE_AUTH (state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
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
    toggleLoading({commit}) {
      commit('TOGGLE_LOADING')
    }
  },
}

export default auth