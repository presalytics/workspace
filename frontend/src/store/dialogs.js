const initialState = () => ({
  modals: [],
})

export default {
  namespaced: true,
  state: initialState,
  getters: {
    modal: (state) => (name) => {
      try {
        return state.modals.filter((cur) => cur.name === name)[0]
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
      }
    },
  },
  mutations: {
    TOGGLE_MODAL (state, payload) {
      if (payload.name) {
        state.modals = state.modals.map((cur) => {
          if (cur.name === payload.name) {
            cur.show = !cur.show
            cur.properties = payload.properties || {}
          } else {
            cur.show = false
            cur.properties = null
          }
          return cur
        })
      }
    },
    ADD_MODAL (state, payload) {
      var existing = state.modals.filter((cur) => cur.name === payload.name) || []
      if (existing.length > 0) {
        existing.forEach((cur) => {
          var idx = state.modals.indexOf(cur)
          if (idx > -1) {
            state.modals.splice(idx, 1)
          }
        })
      }
      state.modals.push({
        name: payload.name,
        show: false,
        properties: null,
      })
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
