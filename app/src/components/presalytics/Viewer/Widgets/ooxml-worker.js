import Dexie from 'dexie'
import Slide0 from './svgs/Slide0.SVG?raw'
import Slide1 from './svgs/Slide1.SVG?raw'
import Slide2 from './svgs/Slide2.SVG?raw'
import Slide3 from './svgs/Slide3.SVG?raw'
import Slide4 from './svgs/Slide4.SVG?raw'
import Slide5 from './svgs/Slide5.SVG?raw'
import Slide6 from './svgs/Slide6.SVG?raw'
import Slide7 from './svgs/Slide7.SVG?raw'
import Slide8 from './svgs/Slide8.SVG?raw'
import Slide9 from './svgs/Slide9.SVG?raw'
import Slide10 from './svgs/Slide10.SVG?raw'
import Slide11 from './svgs/Slide11.SVG?raw'
import Slide12 from './svgs/Slide12.SVG?raw'
import Slide13 from './svgs/Slide12.SVG?raw'

const slideMap = {
  '19eed5a3-de2a-42a6-900d-6fa3b3e9c8ad': Slide0,
  '9d84d79c-136e-4d3d-b908-4dabfe776f23': Slide1,
  '60b628d4-8b64-4a40-a447-c396e5b2ecda': Slide2,
  'dce292fc-6e71-4e79-a412-86a129817873': Slide3,
  '6fc7f35d-f59d-444e-95fd-c96f0f7d6d50': Slide4,
  '8b61765b-58a6-493c-9745-9cc81bf02475': Slide5,
  'db34e1e7-b418-4918-925f-52589c23ee76': Slide6,
  'd1f69357-bdae-4370-8590-de443997b33d': Slide7,
  '83a6cdc2-23ec-40ca-b950-017d95104e93': Slide8,
  '7d6374bd-5507-496f-a49e-d32bae7f9261': Slide9,
  '69042406-9ca8-494d-8710-0016d085576f': Slide10,
  'd1c9018b-63ff-4fe5-bb3a-90e5b970d5bc': Slide11,
  '20ca536f-5d64-4c37-aa8b-d78a3ed569ab': Slide12,
  '62bcc048-f986-41a4-94f6-78f79346e465': Slide13,
}


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

  
  for (const [key, value] in Object.entries(slideMap)) {
    getRecord(key).then((record) => {
      let blob = new Blob([value], {type: 'image/svg+xml'})
      updateRecord(record.id, {svgBlob: blob})
    })

}

  port.addEventListener('message', async (e) => {
    var request = e.data.request
    let record
    let forceRefresh = e.data?.forceRefresh === true ? true : false
    if (e.data.ooxmlId && !(e.data.ooxmlId in activePorts)) {
      activePorts[e.data.ooxmlId] = port
    }
    switch (request) {
      case ('svg'): {
        if (e.data.ooxmlId in slideMap) {
          let blob = new Blob([slideMap[e.data.ooxmlId]], {type: 'image/svg+xml'})
          port.postMessage({
            type: 'SVG_BLOB',
            blob: blob,
            ooxmlId: e.data.ooxmlId,
          })
        } else {
          record = await getOrCreate(e.data.objectType, e.data.ooxmlId, forceRefresh)
          port.postMessage({
            type: 'SVG_BLOB',
            blob: record.svgBlob,
            ooxmlId: e.data.ooxmlId,
          })
        }
        
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




