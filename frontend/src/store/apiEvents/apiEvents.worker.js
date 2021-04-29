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

var querify = function (obj) {
  var str = []
  for (var p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
    }
  }
  return str.join('&')
}

var getEvents = async (query) => {
  return await manageApiErrors(async () => {
    var moreEvts = true
    var page = 1
    while (moreEvts) {
      query.page = page
      var evts = await http.getData(http.hosts.events, 'events?' + querify(query))
      if (evts.length > 0) {
        self.postMessage({ type: 'ADD_EVENTS', payload: evts })
      }
      if (evts.length !== 100) {
        moreEvts = false
      } else {
        page += 1
        evts = null
      }
    }
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
      await getEvents({ storyId: storyId })
      break
    }
    case ('initEvents'): {
      var userId = e.data.userId
      await getEvents({ userId: userId })
      break
    }
  }
}
