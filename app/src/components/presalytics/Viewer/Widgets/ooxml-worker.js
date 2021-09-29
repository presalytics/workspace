import Dexie from 'dexie'
import HttpPlugin, { responseTypes } from '@/plugins/http'


let activePorts = {}

const getAcessToken = async () => {
  // pick an active port
  let port = Object.values(activePorts)[0]
  port.postMessage({ type: 'REFRESH_AUTH' })
  return await new Promise((resolve) => {
    const listener = port.addEventListener('message', function (e) {
      if (e.data?.accessToken) {
        port.removeEventListener('message', listener)
        resolve(e.data.accessToken)
      }
    })
  })
}

const http = new HttpPlugin({
  worker: self,
  accessTokenCallback: getAcessToken
})
const db = new Dexie('ooxmlDb')
const refreshDelta = 1000 * 60 * 5 // refresh on reload five mins

db.version(2).stores({
    ooxml: 'id++, &ooxmlId',
})

var deleteIfExists = async (ooxmlId) => {
  return await db.ooxml
    .where({ ooxmlId: ooxmlId })
    .delete()
}

const getRecord = async (ooxmlId) => {
  return await db.ooxml
                  .where('ooxmlId')
                  .equalsIgnoreCase(ooxmlId)
                  .first()
}

const createRecord = async (ooxmlId, data = {}) => {
  if (!data.svgBlob && !data.imgBlob) throw new Error('Either the "svgBlob" or "imgBlob" must of part of data')
  data.timestamp = Date.now()
  return await db.ooxml.add(data)
}

const updateRecord = async (ooxmlId, data = {}) => {

  let record = await getRecord(ooxmlId)
  if (!record) throw new Error('Record with ooxmlId ' +  ooxmlId + ' does not exist')
  data.timestamp = Date.now()
  return await db.ooxml.update(record.id, data)
}

const getOrCreate = async (objectType, ooxmlId, forceUpdate = false) => {
  let record = await getRecord(ooxmlId)
  if (!record || recordIsExpired(record) || forceUpdate) {
    let blobArray = await Promise.all([
      getSvgFromApi(objectType, ooxmlId),
      getImgFromApi(objectType, ooxmlId)
    ])
    let data = {
      svgBlob: blobArray[0],
      imgBlob: blobArray[1],
    }
    if (record) {
      record = await updateRecord(record.id, data)
    } else {
      record = await createRecord(ooxmlId. data)
    }
  }
  return record 
}

const recordIsExpired = (record) => {
  if (!record) return true
  const delta = Date.now() - record.timestamp
  return delta > refreshDelta
}


var getSvgFromApi = async (objectType, ooxmlId) => {
  return await http.getData('/api/ooxml/' + objectType + '/Svg/' + ooxmlId, {
    redirect: 'follow',
    cache: 'no-store',
  }, responseTypes.BLOB)
}

var getImgFromApi = async (objectType, ooxmlId) => {
  return await http.getData('/api/ooxml/' + objectType + '/Png/' + ooxmlId, {
    redirect: 'follow',
    cache: 'no-store'
  }, responseTypes.BLOB)
}

self.onconnect = function(e) {
  var port = e.ports[0]

  port.addEventListener('message', async (e) => {
    var request = e.data.request
    let record
    let forceRefresh = e.data?.forceRefresh === true ? true : false
    if (e.data.ooxmlId && !(e.data.ooxmlId in activePorts)) {
      activePorts[e.data.ooxmlId] = port
    }
    switch (request) {
      case ('svg'): {
        record = await getOrCreate(e.data.objectType, e.data.ooxmlId, forceRefresh)
        port.postMessage({
          type: 'SVG_BLOB',
          blob: record.svgBlob,
          ooxmlId: e.data.ooxmlId,
        })
        break
      }
      case('img'): {
        record = await getOrCreate(e.data.objectType, e.data.ooxmlId, forceRefresh)
        port.postMessage({
          type: 'IMG_BLOB',
          blob: record.imgBlob,
          ooxmlId: e.data.ooxmlId
        })
        break
      }
      case('delete'): {
        deleteIfExists(e.data.ooxmlId)
        break
      }
      case('disconnect'): {
        delete activePorts[e.data.ooxmlId]
      }
    }
  })

  port.start()
}



