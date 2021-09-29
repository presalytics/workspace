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
