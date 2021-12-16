import Dexie from 'dexie'

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

const db = new Dexie('ooxmlDb')
// const refreshDelta = 1000 * 60 * 5 // refresh on reload five mins

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
  data.ooxmlId = ooxmlId
  let id = await db.ooxml.add(data)
  let record = await db.ooxml.get(id)
  return record
}

const updateRecord = async (recordId, data = {}) => {

  let record = await db.ooxml.get(recordId)
  if (!record) throw new Error('Record with id ' +  recordId + ' does not exist')
  data.timestamp = Date.now()
  await db.ooxml.update(record.id, data)
  return await getRecord(record.ooxmlId)
}

const getOrCreate = async (objectType, ooxmlId) => {
  let record = await getRecord(ooxmlId)
  if (!record) {  // remove other conditions for now (|| recordIsExpired(record) || forceUpdate
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
      record = await createRecord(ooxmlId, data)
    }
    record = await getRecord(ooxmlId)
  }
  return record 
}

// const recordIsExpired = (record) => {
//   if (!record) return true
//   const delta = Date.now() - record.timestamp
//   return delta > refreshDelta
// }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getSvgFromApi = async (objectType, ooxmlId) => {
  return await getFromApi(objectType, ooxmlId, "Svg")
}

const getImgFromApi = async (objectType, ooxmlId) => {
  return await getFromApi(objectType, ooxmlId, "Png")
}

var getFromApi = async (objectType, ooxmlId, ImgType) => {
  const accessToken = await getAcessToken()
  const getter = async () => {
    return await fetch('/api/ooxml/' + objectType + '/' + ImgType + '/' + ooxmlId, {
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken 
      }
    })
  }
  let loop = true
  let blob = null
  while (loop) {
    let resp = await getter()
    if (resp.status == 202) {
      await sleep(1000)
    } else if (resp.status == 200) {
      blob = await resp.blob()
      loop = false
    } else {
      throw new Error('Error downloading image from ooxml api', resp)
    }
  }
  return blob
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




