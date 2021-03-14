import Vue from '../main'

export default {
  state: () => {
    list: []
  },
  mutations: {
    INIT_STORIES (state, payload) {
      state.stories = payload
    }
  },
  actions: {
    async initStories ({ commit }) {
      let stories = await Vue.$http.getData(Vue.$http.hosts.story, '/')
      commit('INIT_STORIES', stories)
    }
  },
}