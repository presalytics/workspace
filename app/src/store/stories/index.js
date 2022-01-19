import Worker from './story.worker?worker'
import {create} from 'jsondiffpatch'
import { cloneDeep } from 'lodash-es'

const workerActions = new Worker()

var jsondiffpatch = create({
  objectHash: function (obj) {
    return obj.id
  },
  cloneDiffValues: true,
})

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
    storiesList: [],
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
    db: (state) => cloneDeep(state),
    storiesList: (state) => {
      return state.stories || []
    },
    story: (state) => (storyId) => {
      return state.stories[storyId]
    },
    outline: (state, getters) => (storyId) => {
      var story = getters.story(storyId)
      return state.outlines[story.outline]
    },
    storiesByUser: (state) => (userId) => {
      return Object.values(state.stories).filter((cur) => {
        var collaborators = Object.values(state.collaborators).filter((ele) => cur.collaborators.includes(ele.id))
        return collaborators.reduce((acc, ele) => {
          if (!acc) {
            if (ele.userId === userId) {
              acc = true
            }
          }
          return acc
        }, false)
      })
    },
    annotation: (state, getters) => (storyId) => {
      var collaborator = Object.values(state.collaborators).filter((cur) => {
        return cur.storyId === storyId && cur.userId === getters.userId
      })
      if (collaborator.length > 0) {
        return state.annotations[collaborator[0].annotationId]
      } else {
        return {
          isFavorite: false,
        }
      }
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
      state.storiesList.push(payload.id)
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
      state.content[payload.storyId] = payload.content
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
      delete state.outlines[story.outline]
      story.pages.forEach((cur) => {
        var page = state.pages[cur]
        page.comments.forEach((ele) => delete state.comments[ele])
        delete state.pages[cur]
      })
      story.ooxmlDocuments.forEach((cur) => delete state.ooxmlDocuments[cur])
      story.collaborators.forEach((cur) => {
        let annotationId = state.collaborators[cur].annotation
        delete state.annotations[annotationId]
        delete state.collaborators[cur]
      })
      delete state.stories[payload.id]
      state.storiesList = state.storiesList.filter((cur) => cur !== payload.id)
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
    async sync( { getters, dispatch }) {
      await dispatch('awaitRestoredState', null, {root: true})

      workerActions.postMessage({
        request: 'workerSync',
        ...getters.db
      })
    },
    async initStories ({ state, dispatch }) {
      await dispatch('sync')
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
    setToken (context, accessToken) {
      workerActions.postMessage({
        request: 'accessToken',
        accessToken: accessToken,
      })
    },
    async toggleIsFavorite ({ getters }, storyId) {
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
    render (context, storyId) {
      workerActions.postMessage({ request: 'render', storyId: storyId })
    },
    setStoryOutline (context, payload) {
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
    deleteStory ({ commit }, deleteCloudEvent) {
      commit('STORY_DELETE', deleteCloudEvent.data.model)
    }
  },
}

export {workerActions as storyWorker, stories}