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
    return obj.id
  },
  cloneDiffValues: true,
})

var currentUsers = {}

var getRelationships = async () => {
    return await http.getData('/api/user/audience/')
}

var getUser = async (userId) => {
    return await http.getData('/api/user/user-info/' + userId + '/')
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

self.addEventListener('message', async (e) => {
  try {
    switch (e.data.request) {
      case ('initUsers'): {
        currentUsers = e.data.users
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
    }
  } catch (err) {
    console.error(err) // eslint-disable-line
  }
})
