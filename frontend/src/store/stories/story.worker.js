import { HttpPlugin } from '../../plugins/http'

var accessToken = ''
var csrf = ''

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

var outlineData = {}
const outlineSyncTimeout = 60 * 1000 // 60 seconds

var clearOutline = (storyId) => {
  delete outlineData[storyId]
}

var setNewOutline = async (storyId, outline) => {
  if (outlineData[storyId]) {
    clearTimeout(outlineData[storyId].timeoutPtr)
  }
  self.postMessage({
    type: 'PATCH_OUTLINE',
    payload: {
      storyId: storyId,
      outline: outline,
    },
  })
  outlineData[storyId] = {
    storyId: storyId,
    outline: outline,
    timeoutPtr: setTimeout(() => syncOutlineWithAPI(outline), outlineSyncTimeout),
  }
}

var pushOutlineToServer = async (outline, storyId) => {
  return await manageApiErrors(async () => {
    return await http.postData(http.hosts.story, storyId + '/outline', outline)
  })
}

var syncOutlineWithAPI = async (outline, storyId) => {
  clearOutline(storyId)
  await pushOutlineToServer(outline, storyId)
}

var getActiveWorkspaces = async () => {
  return await manageApiErrors(async () => {
    return await http.getData(http.hosts.api, 'stories/')
  })
}

var createActiveWorkspace = async (story) => {
  return await manageApiErrors(async () => {
    return await http.postData(http.hosts.api, 'stories/', story)
  })
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
  var stories = await manageApiErrors(async () => {
    return await http.getData(http.hosts.story, '?include_relationships=true')
  })
  return stories.map((cur) => {
    if (cur.outline && cur.outline.length > 1) {
      cur.outline = JSON.parse(cur.outline)
    }
    return cur
  })
}

self.onmessage = async (e) => {
  switch (e.data.request) {
    case ('initStories'): {
      var stories = await getStories()
      self.postMessage({ type: 'INIT_STORIES', payload: stories })

      var activeWorkspaces = await getActiveWorkspaces()

      activeWorkspaces.map(async (cur) => {
        self.postMessage({ type: 'UPDATE_WORKSPACE', payload: cur })
      })

      var activeIds = activeWorkspaces.reduce((acc, cur, i) => {
        acc.push(cur.id)
        return acc
      }, [])

      await Promise.all(stories.filter((cur) => !(activeIds.includes(cur.id))).map(async (cur, i) => {
        var details = await createActiveWorkspace(cur)
        if (details) {
          self.postMessage({ type: 'UPDATE_WORKSPACE', payload: details })
        }
      }))
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
    case ('setOutline'): {
      await setNewOutline(e.data.storyId, e.data.outline)
      break
    }
  }
}
