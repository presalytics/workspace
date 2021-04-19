import Vue from '../../main'
import Worker from './story.worker'
import Cookies from 'js-cookie'

const workerActions = new Worker()

const initialState = () => {
  return {
    loading: false,
    tokenLoaded: false,
    stories: [],
    shareModal: {
      active: false,
      storyId: null,
    },
  }
}

const stories = {
  namespaced: true,
  state: initialState,
  getters: {
    storiesList: (state) => {
      return state.stories || []
    },
    story: (state, getters) => (storyId) => {
      var ret = null
      try {
        ret = getters.storiesList.filter((cur) => {
          return cur.id === storyId
        })[0]
      } catch (err) {
        console.error(err)
      }
      return ret
    },
    annotation: (state, getters) => (storyId) => {
      var ret = {
        isFavorite: false,
      }
      var story = getters.storiesList.filter((cur) => {
        return cur.id === storyId
      })[0]
      if (story) {
        if (story.workspace) {
          if (story.workspace.annotations || false) {
            ret = story.workspace.annotations.filter((cur) => cur.userId === getters.userId)[0]
          }
        }
      }
      return ret
    },
    shareModal: (state) => {
      return state.shareModal
    },
  },
  mutations: {
    INIT_STORIES (state, payload) {
      state.stories = payload
    },
    INIT_STORY_DETAILS (state, payload) {
      state.stories[payload.index] = payload.story
    },
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_TOKEN_LOADED (state, payload) {
      state.tokenLoaded = payload
    },
    UPDATE_WORKSPACE (state, payload) {
      state.stories.forEach((cur, i, arr) => {
        if (cur.id === payload.id) {
          arr[i].workspace = payload
        }
      })
    },
    UPDATE_ANNOTATION (state, payload) {
      var newStories = state.stories.map((cur, i, arr) => {
        if (cur?.workspace?.annotations) {
          if (cur.workspace.annotations.filter((ele) => ele.id === payload.id).length > 0) {
            cur.workspace.annotations = cur.workspace.annotations.map((ele) => {
              if (ele.id === payload.id) {
                return payload
              } else {
                return ele
              }
            })
          }
        }
        return cur
      })
      state.stories = newStories
    },
    RESET_STATE (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => { state[key] = initial[key] })
    },
    TOGGLE_SHARE_MODAL (state, payload) {
      if (!payload) {
        state.shareModal.active = false
      } else {
        state.shareModal.active = !state.shareModal.active
        state.shareModal.storyId = payload
      }
    },
  },
  actions: {
    async initStories ({ commit, dispatch }) {
      workerActions.postMessage({ request: 'initStories' })
    },
    setToken ({ state }, accessToken) {
      workerActions.postMessage({
        request: 'accessToken',
        accessToken: accessToken,
        csrf: Cookies.get('csrftoken'),
      })
    },
    async toggleIsFavorite ({ commit, state, getters }, storyId) {
      var annotation = getters.annotation(storyId)
      workerActions.postMessage({ request: 'toggleIsFavorite', annotation: annotation })
    },
    toggleShareModal ({ commit }, storyId) {
      // eslint-disable-next-line no-unused-expressions
      commit('TOGGLE_SHARE_MODAL', storyId)
    },
  },
}

workerActions.onmessage = e => {
  const vm = Vue
  if (e.data.type === 'REFRESH_AUTH') {
    vm.$auth.getTokenSilently()
  } else {
    vm.$store.commit('stories/' + e.data.type, e.data.payload)
  }
}

export default stories
