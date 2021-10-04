import  HttpPlugin from '@/plugins/http'
import SignalRConnectionManager from './hub-connection'

const http = new HttpPlugin({ worker: self })

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
  var moreEvts = true
  var page = 1
  while (moreEvts) {
    query.page = page
    var evts = await http.getData('/api/event-store/?' + querify(query))
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
}

self.addEventListener('message', async (e) => {
  try {
    switch (e.data.request) {
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
      case ('sendEvent'): {
        eventClient.sendEvent(e.data.eventData)
        break
      }
    }
  } catch(err) {
    console.error(err)  // eslint-disable-line
  }
})

const eventClient = new SignalRConnectionManager({
  inboundEventHandler: (evt) => self.postMessage({type: 'ADD_EVENTS', cloudEvent: evt}),
  accessTokenFn: http.accessTokenCallback.bind(http)
})

eventClient.startConnection()
