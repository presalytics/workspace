import Vue from '../../main'
import Worker from './story.worker'
import Cookies from 'js-cookie'

const workerActions = new Worker()

var jsondiffpatch = require('jsondiffpatch').create({
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

const initialState = () => {
  return {
    annotations: {},
    collaborators: {},
    comments: {},
    content: {},
    loading: false,
    ooxmlDocuments: {},
    outlines: {},
    pages: {},
    permissionTypes: {},
    stories: {},
    tokenLoaded: false,
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
      if (story?.annotations) {
        ret = story.annotations.filter((cur) => cur.userId === getters.userId)[0]
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
    },
    PATCH_STORY (state, payload) {
      jsondiffpatch.patch(state.stories[payload.id], payload.diff)
    },
    SET_OUTLINE (state, payload) {
      state.outlines[payload.id] = payload
    },
    PATCH_OUTLINE (state, payload) {
      jsondiffpatch.patch(state.outlines[payload.outlineId], payload.delta)
    },
    SET_COMMENT (state, payload) {
      state.comments[payload.id] = payload
    },
    PATCH_COMMENT (state, payload) {
      jsondiffpatch.patch(state.comments[payload.id], payload.delta)
    },
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_TOKEN_LOADED (state, payload) {
      state.tokenLoaded = payload
    },
    SET_ANNOTATION (state, payload) {
      state.annotations[payload.id] = payload
    },
    PATCH_ANNOTATION (state, payload) {
      jsondiffpatch.patch(state.annotations[payload.id], payload.delta)
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
        jsondiffpatch(state.content[payload.storyId], payload.contentDelta)
      }
      if (payload.pagesDelta) {
        jsondiffpatch(state.pages, payload.pagesDelta)
      }
    },
    STORY_DELETE (state, payload) {
      var story = state.stories[payload.id]
      story.annotations.forEach((cur) => delete state.annotations[cur])
      delete state.outlines[story.outline.id]
      story.pages.forEach((cur) => {
        var page = state.pages[cur]
        page.comments.forEach((ele) => delete state.comments[ele])
        delete state.pages[cur]
      })
      story.ooxmlDocuments.forEach((cur) => delete state.ooxmlDocuments[cur])
      story.collaborators.forEach((cur) => delete state.collaborators[cur])
      delete state.stories[payload.id]
    },
    SET_PERMISSION_TYPES (state, payload) {
      state.permissionTypes = payload
    },
    SET_PAGE (state, payload) {
      state.pages[payload.id] = payload
    },
    PATCH_PAGE (state, payload) {
      jsondiffpatch.patch(state.pages[payload.id], payload.delta)
    },
    SET_OOXML_DOCUMENT (state, payload) {
      state.ooxmlDocuments[payload.id] = payload
    },
    PATCH_OOXML_DOCUMENT (state, payload) {
      jsondiffpatch.patch(state.ooxmlDocuments[payload.id], payload.delta)
    },
    SET_COLLABORATOR (state, payload) {
      state.collaborators[payload.id] = payload
    },
    PATCH_COLLABORATOR (state, payload) {
      jsondiffpatch.patch(state.collaborators[payload.id], payload.delta)
    },
  },
  actions: {
    async initStories ({ commit, state }) {
      workerActions.postMessage({
        request: 'initStories',
        stories: state.stories,
        annotations: state.annotations,
        collaborators: state.collaborators,
        comments: state.comments,
        ooxmlDocuments: state.ooxmlDocuments,
        outlines: state.outlines,
        pages: state.pages,
      })
      if (Object.keys(state.permissionTypes).length === 0) {
        workerActions.postMessage({ request: 'permissionTypes' })
      }
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
