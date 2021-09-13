import { HttpPlugin } from '../../plugins/http'

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
    var evts = await http.getData('/api/event-store?' + querify(query))
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
  }
})
