class HttpError extends Error {
  constructor (message, status, info) {
    super(message)
    this.status = status
    this.info = info
  }
}

class HttpPlugin {
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
    this.accessTokenCallback = this._defaultAccessTokenCallback
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
      401: this._defaultAccessTokenCallback,
    }
  }

  async callWrapper (callArgs) {
    try {
      return await this._call(...callArgs)
    } catch (err) {
      if (err.status in this.errorHandlers) {
        await this.errorHandlers[err.status]()
        return await this._call(...callArgs)
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
            this.removeEventListener('message', listener)
            resolve(e.data.accessToken)
          }
        })
      })
    } else {
      this.accessToken = await this.authGetTokenFn()
    }
    return this.accessToken
  }

  async _handleResponse (response) {
    if (response.status === 204) {
      return 'success'
    } else if (response.ok) {
      return await response.json()
    } else {
      var message = response.text() || 'An error occured while fetching data'
      var errInfo = {}
      try {
        errInfo = await response.json()
      } catch (err) {
        errInfo = { detail: 'no additional error data' }
      }
      throw new HttpError(message, response.status, errInfo)
    }
  }

  async _call (path, method, data = null, additionalHeaders = {}) {
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
        return await this._handleResponse(response)
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

  async getData (path, additionalHeaders = {}) {
    const resp = await this.callWrapper([path, 'GET', null, additionalHeaders])
    return resp
  }

  async postData (path, data, additionalHeaders = {}) {
    const resp = await this.callWrapper([path, 'POST', data, additionalHeaders])
    return resp
  }

  async putData (path, data, additionalHeaders = {}) {
    return await this.callWrapper([path, 'PUT', data, additionalHeaders])
  }

  async deleteData (path, additionalHeaders = {}) {
    return await this.callWrapper([path, 'DELETE', null, additionalHeaders])
  }
}

HttpPlugin.install = (app, options = {}) => {
  options.getTokenFn = app.config.globalProperties.$auth.getTokenSilently
  app.config.globalProperties.$http = new HttpPlugin(options)
}

export { HttpPlugin, HttpError }
export default HttpPlugin
