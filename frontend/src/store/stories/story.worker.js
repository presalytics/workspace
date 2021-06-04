import { normalize, schema } from 'normalizr'
import { HttpPlugin } from '../../plugins/http'

var jsondiffpatch = require('jsondiffpatch').create({
  objectHash: function (obj) {
    return obj.id
  },
  cloneDiffValues: true,
})

var accessToken = ''
var csrf = ''
var currentStories = {}
var currentAnnotations = {}
var currentPages = {}
var currentComments = {}
var currentPatches = {}  // eslint-disable-line
var currentOutlines = {}
var currentOoxmlDocuments = {}
var currentCollaborators = {}

const annotation = new schema.Entity('annotation')

const comment = new schema.Entity('comment')

const page = new schema.Entity('page', {
  comments: [comment],
})

const outlinePatch = new schema.Entity('outlinePatch')

const outline = new schema.Entity('outline', {
  patches: [outlinePatch],
})

const ooxmlDocument = new schema.Entity('ooxmlDocument')

const collaborator = new schema.Entity('storyCollaborator', {
  annotation: annotation,
})

const story = new schema.Entity('story', {
  pages: [page],
  outline: outline,
  collaborators: [collaborator],
  ooxmlDocuments: [ooxmlDocument],
})

var accessTokenCallbackFn = () => {
  return accessToken
}

var csrfCallbackFn = () => {
  return csrf
}

var manageApiErrors = async (wrappedAsyncFn) => {
  var result
  try {
    result = await wrappedAsyncFn()
  } catch (err) {
    if (err.status === 401 || err.status === 500) {
      csrf = null
      accessToken = null
      self.postMessage({ type: 'REFRESH_AUTH' })
      await new Promise((resolve) => {
        var intptr = setInterval(() => {
          if (csrf && accessToken) {
            clearInterval(intptr)
            resolve()
          }
        }, 50)
      })
      result = await wrappedAsyncFn()
    } else {
      result = null
    }
  }
  return result
}

var updateAnnotation = async (annotation) => {
  return await manageApiErrors(async () => {
    return await http.putData(http.hosts.api, 'stories/annotations/' + annotation.id + '/', annotation)
  })
}

var renderStory = async (storyId) => {
  return await manageApiErrors(async () => {
    return await http.getData(http.hosts.story, storyId + '/json')
  })
}

const httpOptions = {
  accessTokenCallback: accessTokenCallbackFn,
  csrfCallback: csrfCallbackFn,
}

const http = new HttpPlugin(httpOptions)

var getStories = async () => {
  return await manageApiErrors(async () => {
    return await http.getData(http.hosts.api, 'stories/')
  })
}

var genericNewEntityHandler = (currents, setMutationName, patchMutationName, newObject) => {
  if (currents[newObject.id]) {
    var diff = jsondiffpatch.diff(currents[newObject.id], newObject)
    if (diff) {
      self.postMessage({
        type: patchMutationName,
        payload: {
          id: newObject.id,
          diff: diff,
        },
      })
      currents[newObject.id] = newObject
    }
  } else if (Object.keys(newObject).length !== 0) {
    self.postMessage({
      type: setMutationName,
      payload: newObject,
    })
    currents[newObject.id] = newObject
  }
}

var handleNewStoryEntity = (newStory) => genericNewEntityHandler(currentStories, 'SET_STORY', 'PATCH_STORY', newStory)
var handleNewAnnotationEntity = (newAnnotation) => genericNewEntityHandler(currentAnnotations, 'SET_ANNOTATION', 'PATCH_ANNOATION', newAnnotation)
var handleNewCommentEntity = (newComment) => genericNewEntityHandler(currentComments, 'SET_COMMENT', 'PATCH_COMMENT', newComment)
var handleNewPageEntity = (newPage) => genericNewEntityHandler(currentPages, 'SET_PAGE', 'PATCH_PAGE', newPage)
var handleNewOoxmlDocumentEntity = (newOoxmlDocument) => genericNewEntityHandler(currentOoxmlDocuments, 'SET_OOXML_DOCUMENT', 'PATCH_OOXML_DOCUMENT', newOoxmlDocument)
var handleNewCollaboratorEntity = (newCollaborator) => genericNewEntityHandler(currentCollaborators, 'SET_COLLABORATOR', 'PATCH_COLLABORATOR', newCollaborator)

var updateOutlineDocuments = (outlineId, outlineDiff) => {
  if (outlineDiff) {
    self.postMessage({
      type: 'PATCH_OUTLINE',
      payload: {
        id: outlineId,
        delta: outlineDiff,
      },
    })
  }
}

var handleNewOutlineEntity = (newOutline) => {
  if (currentOutlines[newOutline.id]) {
    if (newOutline.latestPatchSequence > currentOutlines[newOutline.id].latestPatchSequence) {
      var diff = jsondiffpatch.diff(currentOutlines[newOutline.id].document, newOutline.document)
      updateOutlineDocuments(newOutline.id, diff)
      currentOutlines[newOutline.id] = newOutline
    }
  } else {
    self.postMessage({
      type: 'SET_OUTLINE',
      payload: newOutline,
    })
    currentOutlines[newOutline.id] = newOutline
  }
}

var handleRefreshedStoriesList = (newStoriesList) => {
  var newNormalizedStories = normalize(newStoriesList, [story])
  Object.values(newNormalizedStories.entities.story || {}).map((cur) => handleNewStoryEntity(cur))
  Object.values(newNormalizedStories.entities.annotation || {}).map((cur) => handleNewAnnotationEntity(cur))
  Object.values(newNormalizedStories.entities.page || {}).map((cur) => handleNewPageEntity(cur))
  Object.values(newNormalizedStories.entities.comment || {}).map((cur) => handleNewCommentEntity(cur))
  Object.values(newNormalizedStories.entities.ooxmlDocument || {}).map((cur) => handleNewOoxmlDocumentEntity(cur))
  Object.values(newNormalizedStories.entities.storyCollaborator || {}).map((cur) => handleNewCollaboratorEntity(cur))
  Object.values(newNormalizedStories.entities.outline || {}).map((cur) => handleNewOutlineEntity(cur))
}

var refreshPermissionTypes = async () => {
  var permissionTypes = await manageApiErrors(async () => {
    return await http.getData(http.hosts.api, 'stories/permission_types')
  })
  if (permissionTypes.length > 0) {
    self.postMessage({ type: 'SET_PERMISSION_TYPES', payload: permissionTypes })
  }
}

var syncGlobals = (data) => {
  currentStories = data.stories || {}
  currentAnnotations = data.annotations || {}
  currentCollaborators = data.collaborators || {}
  currentComments = data.comments || {}
  currentOoxmlDocuments = data.ooxmlDocuments || {}
  currentOutlines = data.outlines || {}
  currentPages = data.pages || {}
}

self.onmessage = async (e) => {
  switch (e.data.request) {
    case ('initStories'): {
      syncGlobals(e.data)
      var stories = await getStories()
      handleRefreshedStoriesList(stories)
      break
    }
    case ('accessToken'): {
      accessToken = e.data.accessToken
      csrf = e.data.csrf
      break
    }
    case ('toggleIsFavorite'): {
      var annotation = e.data.annotation
      annotation.isFavorite = !annotation.isFavorite
      var updatedAnno = await updateAnnotation(annotation)
      if (updatedAnno) {
        self.postMessage({ type: 'UPDATE_ANNOTATION', payload: updatedAnno })
      }
      break
    }
    case ('render'): {
      var content = await renderStory(e.data.storyId)
      if (content) {
        var payload = {
          storyId: e.data.storyId,
          content: content,
        }
        self.postMessage({ type: 'SET_STORY_CONTENT', payload: payload })
      }
      break
    }
    case ('permissionTypes'): {
      await refreshPermissionTypes()
      break
    }
  }
}
