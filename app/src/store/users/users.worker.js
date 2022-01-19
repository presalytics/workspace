import HttpPlugin from '@/plugins/http'
import { create } from 'jsondiffpatch'

const http = new HttpPlugin({ 
  worker: self,
  errorHandlers: {
    404: () => new Promise((resolve) => resolve({retry: false, result: null}))
  }
})

var jsondiffpatch = create({
  objectHash: function (obj) {
    return obj.id || obj.userId || obj.$id || obj.index || obj.idx || obj.$index
  },
  cloneDiffValues: true,
})

var currentUsers = {}

var getRelationships = async () => {
    return await http.getData('/api/user/audience/')
}

var getUserRequestQueue = []

var getUser = async (userId) => {
  if (userId) {
    if (!getUserRequestQueue.includes(userId)) {
      getUserRequestQueue.push(userId)
      var userData = await http.getData('/api/user/user-info/' + userId + '/') 
      var userIdIdx = getUserRequestQueue.indexOf(userId)
      if (userIdIdx > -1) {
        getUserRequestQueue.splice(userIdIdx, 1)
      }
      return userData
    }
  }
  return null
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

const syncEvent = new Event('synced')

var forceSync = async () => {
  return await new Promise( (resolve) => {
    const listener = self.addEventListener('synced', () => {
      self.removeEventListener('synced', listener)
      resolve()
    })
    self.postMessage({
      type: 'SYNC'
    })
  })
}

var initUsers = async () => {
  await forceSync()
  var relations = await getRelationships()
  var myId = relations[0].userId
  var myRelation = {
    user_id: myId,
    related_user_id: myId,
  }
  relations.push(myRelation)
  relations.map(async (cur) => {
    var userId = cur.relatedUserId
    var usr = await getUser(userId)
    if (usr) {
      usr.id = usr.appMetadata.apiUserId
      handleUserUpdate(usr)
    }
  })


}

self.addEventListener('message', async (e) => {
  try {
    switch (e.data.request) {
      case ('initUsers'): {
        initUsers()
        break
      }
      case ('updateUser'): {
        var userId = e.data.userId
        var usr = await getUser(userId)
        if (usr) {
          usr.id = usr.appMetadata.apiUserId
          handleUserUpdate(usr)
        }
        break
      }
      case ('workerSync'): {
        currentUsers = e.data.currentUsers
        self.dispatchEvent(syncEvent)
        break
      }
    }
  } catch (err) {
    console.error(err) // eslint-disable-line
  }
})