export class HttpError extends Error {
  constructor (message, status, info) {
    super(message)
    this.status = status
    this.info = info
  }
}

export const responseTypes = {
  JSON: "json",
  TEXT: "text",
  BLOB: "blob"
}

export default class HttpPlugin {
  constructor (options = {}) {
    this._base_headers = {}
    this._base_headers['Content-Type'] = 'application/json'
    this._base_options = {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      redirect: 'manual',
      referrerPolicy: 'origin',
      referrer: location.origin,
    }
    this.accessToken = null
    this.authGetTokenFn = options.getTokenFn
    this.accessTokenCallback = options.accessTokenCallback || this._defaultAccessTokenCallback
    this.errorHandlers = {
      ...this.defaultErrorHandlers(),
      ...options.errorHandlers,
    }
    this.worker = options.worker || null
    this.propagate_exceptions = options.propagate_exceptions || true
    if (this.worker) {
      this.worker.addEventListener('message', function (e) {
        if (e.data?.accessToken) {
          this.accessToken = e.data.accessToken
        }
      })
    }
    if (!this.worker && !this.authGetTokenFn) {
      throw new Error('This class must either have the "getTokenFn" or "worker" options specified.')
    }
  }

  defaultErrorHandlers() {
    return {
      401: async () => {
      await this.accessTokenCallback()
      return {retry: true}
      }
    }
  }

  async callWrapper (callArgs) {
    try {
      return await this._call(...callArgs)
    } catch (err) {
      if (err.status in this.errorHandlers) {
        let correction = await this.errorHandlers[err.status].bind(this)()
        if (correction?.retry) {
          return await this._call(...callArgs)
        } else {
          if (Object.prototype.hasOwnProperty.call(correction, 'result')) return correction.result
          throw(err)
        }
      } else {
        if (this.propagate_exceptions) {
          throw (err)
        } else {
          return null
        }
      }
    }
  }

  async _getHeaders () {
    var headers = this._base_headers
    headers.Authorization = await this._getBearerToken()
    return headers
  }

  async _getBearerToken () {
    const accessToken = await this.accessTokenCallback()
    return 'Bearer ' + accessToken
  }

  async _defaultAccessTokenCallback () {
    if (this.accessToken) return this.accessToken
    if (this.worker) {
      this.worker.postMessage({ type: 'REFRESH_AUTH' })
      this.accessToken = await new Promise((resolve) => {
        const listener = this.worker.addEventListener('message', function (e) {
          if (e.data?.accessToken) {
            this.worker.removeEventListener('message', listener)
            resolve(e.data.accessToken)
          }
        })
      })
    } else {
      this.accessToken = await this.authGetTokenFn()
    }
    return this.accessToken
  }

  async _handleResponse (response, responseType = responseTypes.JSON) {
    if (response.status === 204) {
      return 'success'
    } else if (response.ok) {
      switch(responseType) {
        case (responseTypes.JSON): {
          return await response.json()
        }
        case (responseTypes.BLOB): {
          return await response.blob()
        }
        case (responseTypes.TEXT): {
          return await response.text()
        }
        default: {
          throw new HttpError("Requested repsonseType not understood by HttpPlugin", response.status, null)
        }
      }

    } else {
      var message = await response.text() || 'An error occured while fetching data'
      var errInfo = {}
      try {
        errInfo = await response.json()
      } catch (err) {
        errInfo = { detail: 'no additional error data' }
      }
      throw new HttpError(message, response.status, errInfo)
    }
  }

  async _call (path, method, data = null, additionalHeaders = {}, responseType = responseTypes.JSON) {
    const baseHeaders = await this._getHeaders()
    const headers = {
      ...baseHeaders,
      ...additionalHeaders,
    }
    const options = {
      ...this._base_options,
      headers: headers,
      method: method,
    }
    if (data) {
      options.body = JSON.stringify(data)
    }
    const response = await fetch(path, options)
      try {
        return await this._handleResponse(response, responseType)
      } catch (err) {
        err.httpInfo = err.httpInfo || {}
        err.httpInfo.path = path
        err.httpInfo.method = method
        err.httpInfo.headers = headers
        err.httpInfo.options = options
        if (data) err.httpInfo.data = data
        throw (err)
      }
    }

  async getData (path, additionalHeaders = {}, responseType = responseTypes.JSON) {
    const resp = await this.callWrapper([path, 'GET', null, additionalHeaders, responseType])
    return resp
  }

  async postData (path, data, additionalHeaders = {}, responseType = responseTypes.JSON) {
    const resp = await this.callWrapper([path, 'POST', data, additionalHeaders, responseType])
    return resp
  }

  async putData (path, data, additionalHeaders = {}, responseType = responseTypes.JSON) {
    return await this.callWrapper([path, 'PUT', data, additionalHeaders, responseType])
  }

  async deleteData (path, additionalHeaders = {}, responseType = responseTypes.JSON) {
    return await this.callWrapper([path, 'DELETE', null, additionalHeaders, responseType])
  }
}

HttpPlugin.install = (Vue, options = {}) => {
  options.getTokenFn = Vue.prototype.$auth.getTokenSilently.bind(Vue.prototype.$auth)
  Vue.prototype.$http = new HttpPlugin(options)
}
