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
    console.log(err)
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

const httpOptions = {
  accessTokenCallback: accessTokenCallbackFn,
  csrfCallback: csrfCallbackFn,
}

const http = new HttpPlugin(httpOptions)

var getRelationships = async () => {
  return await manageApiErrors(async () => {
    return await http.getData(http.hosts.api, 'user/relationships/')
  })
}

var getUser = async (userId) => {
  return await manageApiErrors(async () => {
    return await http.getData(http.hosts.api, 'user/user-info/' + userId + '/')
  })
}

self.onmessage = async (e) => {
  switch (e.data.request) {
    case ('accessToken'): {
      accessToken = e.data.accessToken
      csrf = e.data.csrf
      break
    }
    case ('initUsers'): {
      var relations = await getRelationships()
      var myId = relations.relationships[0].user_id
      var myRelation = {
        user_id: myId,
        related_user_id: myId,
      }
      relations.relationships.push(myRelation)
      relations.relationships.map(async (cur, i) => {
        var userId = cur.related_user_id
        var usr = await getUser(userId)
        if (usr) {
          self.postMessage({ type: 'ADD_USER', payload: usr })
        }
      })
    }
  }
}
