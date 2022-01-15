import Dexie from 'dexie'
import { Buffer } from 'buffer'

const db = new Dexie('images')
// const refreshDelta = 1000 * 60 * 5 // refresh on reload five mins
var accessToken = null

db.version(3).stores({
    images: 'id++, apiKey, imageType, source',
})

const MIMETypeMap = [
  {
    MIMEType: "image/svg+xml",
    imageType: "svg"
  },
  {
    MIMEType: "image/png",
    imageType: "png"
  }
]

class ImageRequest {
  constructor(apiKey, imageType, metadata) {
    this.apiKey = apiKey
    this.imageType = imageType
    this.metadata = metadata,
    this.timestamp = Date.now()
    this.status = "created"
  }

  isEqual(imageRequest) {
    return this.apiKey === imageRequest.apiKey && this.imageType === imageRequest.imageType
  }
}

class ImageManager {
  constructor(worker) {
    this.worker = worker
    this.activeRequests = []
  }

  enqueue(imageRequest) {
    var sameRequests = this.activeRequests.filter( (cur) => cur.isEqual(imageRequest))
    if (sameRequests.length === 0) {
      this.activeRequests.push(imageRequest)
      this.processRequest(imageRequest)
    }
  }

  async processRequest(imageRequest) {
    imageRequest.status = "processing"
    var record = await this.getOrCreate(imageRequest.apiKey, imageRequest.imageType, imageRequest.metadata)
    this.postImage(record)
    imageRequest.status = "finished"
    let idx = this.activeRequests.indexOf(imageRequest)
    if (idx > -1) {
      this.activeRequests.splice(idx, 1)
    }
  }

  getMIMEType(imageType) {
    var entries = MIMETypeMap.filter( (cur) => cur.imageType === imageType)
    if (entries.length == 1) {
      return entries[0].MIMEType
    } else {
      throw new Error('Invalid Image Type: ' + imageType)
    }
  }

  getImageType(MIMEType) {
    var entries = MIMETypeMap.filter( (cur) => cur.MIMEType === MIMEType)
    if (entries.length == 1) {
      return entries[0].imageType
    } else {
      throw new Error('Invalid MIMEType: ' + MIMEType)
    }
  }

  async getAccessToken() {
    if (accessToken) return accessToken
    return await new Promise( (resolve) => {
      const listener = this.worker.addEventListener('message', function(e) {
        if (e.data?.accessToken) {
          this.worker.removeEventListener('message', listener)
          accessToken = e.data.accessToken
          resolve(accessToken)
        }
      })
      this.worker.postMessage({type: 'REFRESH_AUTH'})
    })
  }

  postImage(record) {
    this.worker.postMessage({
      type: 'IMG_BLOB',
      imageType: record.imageType,
      blob: record.blob,
      metadata: record.metadata,
      apiKey: record.apiKey,
      source: record.source,
      timestamp: record.timestamp
    })
  }

  async handleMessage(message) {
    if (message.accessToken) {
      accessToken = message.accessToken
    }
    let key = message.request || message.type || ''
    switch (key) {
      case('delete'): {
        this.deleteIfExists(message.ooxmlId)
        break
      }
      case('story.svg_created'): {
        await this.handleApiEvent(message)
        break
      }
      case('story.png_created'): {
        await this.handleApiEvent(message)
        break
      }
      case('getImage'): {
        var metadata = {
          source: message.source || message.metadata?.source,
        }
        if (message.metadata) {
          metadata = {...message.metadata, ...metadata}
        }
        this.enqueue(new ImageRequest(message.apiKey, message.imageType, metadata))
      }
    }
  }
  
  async handleApiEvent(cloudEvent)
  {
    const decoded = Buffer.from(cloudEvent.data.model.file, 'base64').toString('utf-8')
    const imageType = cloudEvent.type === 'story.svg_created' ? 'svg' : 'png'
    var blob = new Blob([decoded], {type: this.getMIMEType(imageType)})
    var record = await this.getRecord(cloudEvent.data.model.ooxmlId, imageType)
    var newMetadata = {
      eventId: cloudEvent.id,
      storyId: cloudEvent.data.model.storyId,
      ooxmlId: cloudEvent.data.model.ooxmlId,
      source: 'ooxml'
    }
    if (record) {
      record = await this.updateRecord(record.id, blob, newMetadata)
    } else {
      record = await this.createRecord(newMetadata.ooxmlId, imageType, blob, newMetadata)
    }
    this.enqueue(new ImageRequest(newMetadata.ooxmlId, imageType, record.metadata))
  }

  async deleteIfExists(apiKey) {
    return await db.images
      .where({ apiKey: apiKey })
      .delete()
  }
  
  async getRecord(apiKey, imageType) {
    return await db.images
                    .where({
                      apiKey: apiKey,
                      imageType: imageType
                    }).first()
  }
  
  async createRecord(apiKey, imageType, blob, metadata = {}) {
    var data = {
      apiKey: apiKey,
      imageType: imageType,
      blob: blob,
      metadata: metadata,
      timestamp: Date.now(),
      source: metadata.source
    }
    let id = await db.images.add(data)
    let record = await db.images.get(id)
    return record
  }
  
  async updateRecord(recordId, blob, metadata = {}) {
  
    let record = await db.images.get(recordId)
    if (!record) throw new Error('Record with id ' +  recordId + ' does not exist')
    var data = {
      blob: blob,
      metadata: {...record.metadata, ...metadata},
      timestamp: Date.now()
    }
    await db.images.update(record.id, data)
    return await this.getRecord(record.apiKey, record.imageType)
  }
  
  async getOrCreate(apiKey, imageType, metadata = {}) {
    let record = await this.getRecord(apiKey, imageType)
    if (!record) { 
      record = await this.createRecordFromSource(apiKey, imageType, metadata)
    }
    return record 
  }
  
  async createRecordFromSource(apiKey, imageType, metadata) {
    var record
    switch (metadata.source) {
      case ('ooxml'): {
        record =  await this.createRecordFromOoxmlApi(apiKey, imageType, metadata)
        break
      }
    }
    return record
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createRecordFromOoxmlApi(apiKey, imageType, metadata = {})
  {
    if (!metadata.objectType) throw new Error('Property `metadata.objectType` is required to get an image from the Ooxml Api.')
    var blob
    switch (imageType) {
      case('svg'): {
        blob = await this.getFromApi(metadata.objectType, apiKey, "Svg")
        break
      }
      case('png'): {
        blob = await this.getFromApi(metadata.objectType, apiKey, "Png")
        break
      }
    }
    Object.assign(metadata, {
      source: 'ooxml',
      ooxmlId: apiKey
    })
    return await this.createRecord(apiKey, imageType, blob, metadata)
  }
  
  async getFromApi(objectType, ooxmlId, ImgType) {
    var token = await this.getAccessToken()
    const getter = async () => {
      return await fetch('/api/ooxml/' + objectType + '/' + ImgType + '/' + ooxmlId, {
        redirect: 'follow',
        cache: 'no-store',
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
    }
    let loop = true
    let blob = null
    let counter = 0
    let maxLoops = 5
    while (loop) {
      let resp = await getter()
      if (resp.status == 202) {
        await this.sleep(1000)
      } else if (resp.status === 200) {
        blob = await resp.blob()
        loop = false
      } else if (resp.status === 401) {
        accessToken = null
        accessToken = await this.getAccessToken()
        token = accessToken
      } else {
        throw new Error('Error downloading image from ooxml api', resp)
      }
      if (counter > maxLoops) {
        throw new Error('Max retries exceeded', resp)
      }
      counter = counter + 1
    }
    return blob
  }
}

const mgr = new ImageManager(self)

self.addEventListener('message', function(e) {
  try {
    mgr.handleMessage(e.data)
  } catch (err) {
    console.error(err)  // eslint-disable-line
  }
})



