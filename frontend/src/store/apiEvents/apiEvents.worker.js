import { HttpPlugin } from '../../plugins/http'

var accessToken = null

var accessTokenCallbackFn = () => {
  return accessToken
}

var manageApiErrors = async (wrappedAsyncFn) => {
  var result
  try {
    result = await wrappedAsyncFn()
  } catch (err) {
    if (err.status === 401 || err.status === 500) {
      accessToken = null
      self.postMessage({ type: 'REFRESH_AUTH' })
      await new Promise((resolve) => {
        var intptr = setInterval(() => {
          if (accessToken) {
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

var getStoryEvents = async (storyId) => {
  return await manageApiErrors(async () => {
    return await http.getData(http.hosts.events, 'events?storyId=' + storyId)
  })
}

const httpOptions = {
  accessTokenCallback: accessTokenCallbackFn,
  csrfCallback: () => null,
}

const http = new HttpPlugin(httpOptions)

self.onmessage = async (e) => {
  switch (e.data.request) {
    case ('accessToken'): {
      accessToken = e.data.accessToken
      break
    }
    case ('getStoryEvents'): {
      var storyId = e.data.storyId
      var events = await getStoryEvents(storyId) || []
      if (events.length > 0) {
        self.postMessage({ type: 'ADD_EVENTS', payload: events })
      }
    }
  }
}
