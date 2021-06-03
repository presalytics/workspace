import Dexie from 'dexie'

const db = new Dexie('ooxmlDb')
const refreshDelta = 1000 * 60 * 5 // refresh on reload five mins

db.version(1).stores({
    ooxmlSvgs: 'id++,ooxmlId',
})

var putSvg = async (ooxmlId, blob) => {
    await deleteIfExists(ooxmlId)
    await db.ooxmlSvgs.add({
        ooxmlId: ooxmlId,
        blob: blob,
        timestamp: Date.now(),
    })
}

var deleteIfExists = async (ooxmlId) => {
  return await db.ooxmlSvgs
    .where({ ooxmlId: ooxmlId })
    .delete()
}

var getSvg = async (ooxmlId) => {
    var svgData = await db.ooxmlSvgs
        .where('ooxmlId')
        .equalsIgnoreCase(ooxmlId)
        .first()

    if (svgData) {
        var delta = Date.now() - svgData.timestamp
        var expired = delta > refreshDelta
        if (!expired) {
            return svgData.blob
        } else {
            return null
        }
    } else {
        return null
    }
}

var accessToken = ''
var csrf = ''

var wait = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

var manageApiErrors = async (wrappedAsyncFn) => {
  var result
  try {
    result = await wrappedAsyncFn()
  } catch (err) {
    if (err.status === 401 || err.status === 500) {
      accessToken = null
      self.postMessage({ type: 'accessToken' })
      await new Promise((resolve) => {
        var intptr = setInterval(() => {
          if (accessToken) {
            clearInterval(intptr)
            resolve()
          }
        }, 50)
      })
      result = await wrappedAsyncFn()
    } else if (err.status === 404) {
      await wait(1000) // wait a second for backend cache to populate
      result = await wrappedAsyncFn()
    } else {
      result = null
    }
  }
  return result
}

var getOoxmlFromApi = async (objectType, ooxmlId) => {
  return await manageApiErrors(async () => {
    return await fetch('/api/ooxml/' + objectType + '/Svg/' + ooxmlId, {
      method: 'GET',
      credentials: 'include',
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    })
  })
}

var getOoxmlSvg = async (objectType, id, forceRefresh = false) => {
    var key = 'ooxml-key-' + id
    var blob = await getSvg(key)
    if (blob && !forceRefresh) {
      return blob
    } else {
      var response = await getOoxmlFromApi(objectType, id)
      if (!response.bodyUsed) {
        blob = await response.blob()
        putSvg(key, blob)
        return blob
      } else {
        throw new Error('Error processing Ooxml Svg.  Please retry.')
      }
  }
}

var getIframeBlob = async (url) => {
  var response = await manageApiErrors(async () => {
    return await fetch(url, {
      method: 'GET',
      credentials: 'include',
      redirect: 'follow',
      cache: 'no-cache',
      mode: 'cors',
      referrerPolicy: 'origin',
      referrer: location.origin,
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    })
  })
  if (response.ok && !response.bodyUsed) {
    return await response.blob()
  } else {
    throw new Error('Invalid response from Story API cache')
  }
}

var createBlobFromDataUrl = async (dataUrl) => {
  return await (await fetch(dataUrl)).blob()
}

var createThumbnail = async (pageId, dataUrl) => {
  var formData = new FormData()
  var filename = pageId + '.png'
  var blob = await createBlobFromDataUrl(dataUrl)
  formData.append('image', blob)
  formData.append('filename', filename)
  var headers = {
    Authorization: 'Bearer ' + accessToken,
  }
  headers['Content-Disposition'] = 'form-data; name="image"; filename="' + filename + '"'
  headers['X-CSRFToken'] = csrf
  await manageApiErrors(async () => {
    return await fetch('/api/workspace/stories/page/' + pageId + '/thumbnail', {
      method: 'POST',
      body: formData,
      redirect: 'follow',
      cache: 'no-cache',
      headers: headers,
    })
  })
}

self.onmessage = async ({ data }) => {
  var request = data.request
  console.log("Screen request received: " + request) // eslint-disable-line
  switch (request) {
    case ('ooxmlsvg'): {
      var svgBlob = await getOoxmlSvg(data.objectType, data.ooxmlId)
      self.postMessage({
        type: 'ooxmlSvgBlob',
        blob: svgBlob,
        ooxmlId: data.ooxmlId,
      })
      break
    }
    case ('accessToken'): {
      accessToken = data.accessToken
      csrf = data.csrf
      break
    }
    case ('cachedFrame'): {
      var iframeBlob = await getIframeBlob(data.src)
      self.postMessage({
        type: 'cachedIframeBlob',
        nonce: data.nonce,
        blob: iframeBlob,
      })
      break
    }
    case ('makeThumbnail'): {
      console.log(data)  // eslint-disable-line
      var thumbnailUrl = await createThumbnail(data.pageId, data.dataUrl)
      self.postMessage({ type: 'updateThumbnail', storyId: data.storyId, pageId: data.pageId, thumbnailUrl: thumbnailUrl })
    }
  }
}
