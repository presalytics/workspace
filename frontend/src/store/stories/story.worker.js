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

const httpOptions = {
  accessTokenCallback: accessTokenCallbackFn,
  csrfCallback: csrfCallbackFn,
}

const http = new HttpPlugin(httpOptions)

var getStories = async () => {
  return await http.getData(http.hosts.story, '?include_relationships=true')
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
    }
  }
}
