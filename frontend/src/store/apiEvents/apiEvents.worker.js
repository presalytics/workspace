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

var getUserEvents = async (userId) => {
  return await manageApiErrors(async () => {
    return await http.getData(http.hosts.events, 'events?userId=' + userId)
  })
}

const httpOptions = {
  accessTokenCallback: accessTokenCallbackFn,
  csrfCallback: () => null,
}

const http = new HttpPlugin(httpOptions)

self.onmessage = async (e) => {
  var events = []
  switch (e.data.request) {
    case ('accessToken'): {
      accessToken = e.data.accessToken
      break
    }
    case ('getStoryEvents'): {
      var storyId = e.data.storyId
      events = await getStoryEvents(storyId) || []
      if (events.length > 0) {
        self.postMessage({ type: 'ADD_EVENTS', payload: events })
      }
      break
    }
    case ('initEvents'): {
      var userId = e.data.userId
      events = await getUserEvents(userId) || []
      if (events.length > 0) {
        self.postMessage({ type: 'ADD_EVENTS', payload: events })
      }
      break
    }
  }
}
