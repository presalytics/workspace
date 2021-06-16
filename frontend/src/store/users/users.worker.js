import { HttpPlugin } from '../../plugins/http'

var jsondiffpatch = require('jsondiffpatch').create({
  objectHash: function (obj) {
    return obj.id
  },
  cloneDiffValues: true,
})

var accessToken = ''
var csrf = ''
var currentUsers = {}

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

var handleUserUpdate = (userData) => genericNewEntityHandler(currentUsers, 'SET_USER', 'PATCH_USER', userData)

self.onmessage = async (e) => {
  switch (e.data.request) {
    case ('accessToken'): {
      accessToken = e.data.accessToken
      csrf = e.data.csrf
      break
    }
    case ('initUsers'): {
      currentUsers = e.data.users
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
          usr.id = usr.app_metadata.api_user_id
          handleUserUpdate(usr)
        }
      })
    }
  }
}
