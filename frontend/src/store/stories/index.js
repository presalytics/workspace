import Vue from '../../main'
import Worker from './story.worker'
import Cookies from 'js-cookie'
import { template } from 'lodash'

const workerActions = new Worker()

var diffPatch = require('jsondiffpatch').create({
  objectHash: function (obj) {
    return obj.id
  },
  cloneDiffValues: true,
})

class InvalidOutlineError extends Error {
   constructor (message, outline, storyId) {
     super(message)
     this.outline = outline
     this.storyId = storyId
   }
}

// class StoriesList {
//   constructor () {
//     this.list = []
//   }

//   getIndexFromId (storyId) {
//     var indexMatcher = (ele) => ele.id === storyId
//     return this.list.findIndex(indexMatcher)
//   }

//   getIndicesByAnnoationId (annoationId) {
//     var indexMatcher = (ele) => ele.id === annoationId
//     return this.list.reduce((acc, cur, i) => {
//       if (!acc.storyIdx && !acc.annotationIdx) {
//         if (cur.workspace?.annoations) {
//           var annotationIdx = cur.workspace.annotations.findIndex(indexMatcher)
//           if (annotationIdx >= 0) {
//             acc = {
//               storyIdx: cur.id,
//               annotationIdx: annotationIdx,
//             }
//           }
//         }
//       }
//       return acc
//     }, {})
//   }

//   getAnnotationById (annotationId) {
//     var idxs = this.getIndicesByAnnoationId(annotationId)
//     if (idxs.storyIdx && idxs.annotationIdx) {
//       return this.list[idxs.storyIdx].workspace.annoations[idxs.annotationIdx]
//     } else {
//       return null
//     }
//   }

//   getStoryById (storyId) {
//     var idx = this.getIndexFromId(storyId)
//     if (idx >= 0) {
//       return this.list[idx]
//     } else {
//       return null
//     }
//   }

//   patchStory (story) {
//     var index = this.getIndexFromId(story.id)
//     if (index >= 0) {
//       for (var [key, val] of story.entries) {
//         if (key in this.list[index]) {
//           if (this.list[index][key] !== val) {
//             this.list[index][key] = val
//           }
//         } else {
//           this.list[index][key] = val
//         }
//       }
//     }
//   }

//   patchOutline (storyId, delta) {
//     var index = this.getIndexFromId(storyId)
//     if (index >= 0) {
//       diffPatch.patch(this.list[index].outline, delta)
//     }
//   }
// }

const initialState = () => {
  return {
    loading: false,
    tokenLoaded: false,
    stories: {},
    storiesList: [],
    workspaces: {},
    workspacesList: [],
    annotations: {},
    outlines: {},
    outlineDiffs: [],
    content: {},
    pages: {},
    shareModal: {
      active: false,
      storyId: null,
    },
    table: {
      columns: [],
      timeWindow: 'month',
    },
    viewPage: {
      actionPanel: false,
      slidePanel: false,
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
      return this.stories.getStoryById(storyId)
    },
    outline: (state, getters) => (storyId) => {
      var story = getters.story(storyId)
      if (story) {
        try {
          return story.outline
        } catch (err) {
          throw new InvalidOutlineError('This story outline could not be parsed', story.outline, story.id)
        }
      }
    },
    storiesByUser: (state, getters) => (userId) => {
      return getters.storiesList.filter((cur) => {
        var isUserStory = false
        if (cur.collaborators?.length > 0) {
          isUserStory = cur.collaborators.reduce((acc, ele) => {
            if (!acc) {
              acc = ele.user_id === userId
            }
            return acc
          }, false)
        }
        return isUserStory
      })
    },
    annotation: (state, getters) => (storyId) => {
      var ret = {
        isFavorite: false,
      }
      var story = getters.storiesList.getStoryById(storyId)
      if (story?.workspace?.annotations) {
        ret = story.workspace.annotations.filter((cur) => cur.userId === getters.userId)[0]
      }
      return ret
    },
    shareModal: (state) => {
      return state.shareModal
    },
    table: (state) => {
      return state.table
    },
    viewPage: (state) => {
      return state.viewPage
    },
  },
  mutations: {
    SET_STORY (state, payload) {
      state.stories[payload.id] = payload
      if (!state.storiesList.includes(payload.id)) {
        state.storiesList.push(payload.id)
      }
    },
    PATCH_STORY (state, payload) {
      for (var [key, val] in payload) {
        state.stories[payload.id][key] = val
      }
    },
    SET_OUTLINE (state, payload) {
      state.outlines[payload.id] = payload
      if (!state.outlineList.includes(payload.id)) {
        state.outlines.push(outline.id)
      }
    },
    PATCH_OUTLINE (state, payload) {
      diffPatch.patch(state.outlines[payload.outlineId], payload.delta)
      state.outlineDiffs.push({
        outlineId: payload.outlineId,
        sequence: payload.sequence,
        delta: payload.delta,
      })
    },
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_TOKEN_LOADED (state, payload) {
      state.tokenLoaded = payload
    },
    SET_WORKSPACE (state, payload) {
      state.stories[payload.storyId].workspace = payload.id
      state.workspaces[payload.id] = payload
    },
    PATCH_WORKSPACE (state, payload) {
      for (var [key, val] in payload) {
        state.workspaces[payload.id][key] = val
      }
    },
    SET_ANNOTATION (state, payload) {
      state.workspaces[payload.workspaceId] = payload.id
      state.annoations[payload.id] = payload
    },
    PATCH_ANNOTATION (state, payload) {
      for (var [key, val] in payload) {
        state.annoations[payload.id][key] = val
      }
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
    TOGGLE_RIGHT_PANEL (state) {
      state.panels.rightPanel = !state.panels.rightPanel
    },
    TOGGLE_SLIDENAV_PANEL (state) {
      state.panels.slideNav = !state.panels.slideNav
    },
    SET_STORY_CONTENT (state, payload) {
      var pageIds = payload.pages.map((cur) => cur.id)
      payload.content.pages = pageIds
      state.content[payload.storyId] = payload.content
      payload.pages.forEach((cur) => {
        state.pages[cur.id] = cur
      })
    },
    PATCH_STORY_CONTENT (state, payload) {
      if (payload.contentDelta) {
        diffPatch(state.content[payload.storyId], payload.contentDelta)
      }
      if (payload.pagesDelta) {
        diffPatch(state.pages, payload.pagesDelta)
      }
    },
    STORY_DELETE (state, payload) {
      var workspaceId = state.stories[payload.id].workspaceId
      var annotationId = state.workspaces[workspaceId].annotationId
      delete state.annoations[annotationId]
      delete state.workspaces[workspaceId]
      delete state.stories[payload.id]
      state.content.pages.forEach((cur) => delete state.pages[cur])
      delete state.content[payload.id]
      delete state.outlines[payload.id]
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
    initTableColumns ({ commit }, columnList) {
      commit('ADD_TABLE_COLUMNS', columnList)
    },
    render ({ commit }, storyId) {
      workerActions.postMessage({ request: 'render', storyId: storyId })
    },
    setStoryOutline ({ commit }, payload) {
      workerActions.postMessage({
        request: 'setOutline',
        storyId: payload.storyId,
        outline: payload.outline,
      })
    },
    syncIds ({ getters, dispatch }, payload) {
      var storyId = payload.id
      var outline = getters.outline(storyId)
      var hasMissingsIds = outline.pages.filter((cur) => !cur.id).length > 0
      if (hasMissingsIds) {
        outline.pages = outline.pages.map((cur, i) => {
          cur.id = payload.pages[i].id
          return cur
        })
        dispatch('setStoryOutline', { storyId: storyId, outline: outline })
      }
    },
  },
}

workerActions.onmessage = e => {
  const vm = Vue
  if (e.data.type === 'REFRESH_AUTH') {
    vm.$auth.getTokenSilently()
  } else {
    vm.$store.commit('stories/' + e.data.type, e.data.payload)
    if (e.data.type === 'UPDATE_WORKSPACE') {
      vm.$store.dispatch('stories/syncIds', e.data.payload)
    }
  }
}

export default stories
