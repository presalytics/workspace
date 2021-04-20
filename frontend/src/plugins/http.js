import Cookies from 'js-cookie'

var ensureTrailingSlash = (url) => {
  if (!(url.endsWith('/'))) {
    url += '/'
  }
  return url
}

const storyHost = ensureTrailingSlash(process.env.VUE_APP_STORY_HOST)
const siteHost = ensureTrailingSlash(process.env.VUE_APP_SITE_HOST)
const ooxmlAutomationHost = ensureTrailingSlash(process.env.VUE_APP_OOXML_AUTOMATION_HOST)
const workspaceApiHost = ensureTrailingSlash(process.env.VUE_APP_WORKSPACE_API_URL)
const eventsHost = ensureTrailingSlash(process.env.VUE_APP_EVENTS_API_URL)

class HttpError extends Error {
  constructor (message, status, info) {
    super(message)
    this.status = status
    this.info = info
  }
}

class HttpPlugin {
  constructor (options = {}) {
    this.hosts = {
      story: options.storyHost || storyHost,
      site: options.siteHost || siteHost,
      ooxmlAutomation: options.ooxmlAutomationHost || ooxmlAutomationHost,
      api: options.workspaceApiHost || workspaceApiHost,
      events: options.eventsHost || eventsHost,
    }
    this._use_csrf = options.use_csrf || true
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
    this.accessTokenCallback = options.accessTokenCallback || null
    this.csrfCallback = options.csrfCallback || null
  }

  async _getHeaders (host) {
    var headers = this._base_headers
    if (this._use_csrf) {
      var csrf = this._getCsrf()
      if (host === this.hosts.api && csrf) {
        headers['X-CSRFToken'] = csrf
      } else {
        headers.Authorization = await this._getBearerToken()
      }
    } else {
      headers.Authorization = await this._getBearerToken()
    }
    return headers
  }

  async _getBearerToken () {
    const accessToken = await this.accessTokenCallback()
    return 'Bearer ' + accessToken
  }

  _getCsrf () {
    if (this.csrfCallback) {
      return this.csrfCallback()
    } else {
      return Cookies.get('csrftoken')
    }
  }

  async _handleResponse (response) {
    if (response.status === 204) {
      return 'success'
    } else if (response.ok) {
      return await response.json()
    } else {
      var message = 'An error occured while fetching data'
      var errInfo = null
      try {
        errInfo = await response.json()
      } catch (err) {
        errInfo = { detail: 'no additional error data' }
      }
      throw new HttpError(message, response.status, errInfo)
    }
  }

  async _call (host, path, method, data = null, additionalHeaders = {}) {
    const baseHeaders = await this._getHeaders(host)
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
    const response = await fetch(host + path, options)
    return await this._handleResponse(response)
  }

  async getData (host, path, additionalHeaders = {}) {
    const resp = await this._call(host, path, 'GET', null, additionalHeaders)
    return resp
  }

  async postData (host, path, data, additionalHeaders = {}) {
    const resp = await this._call(host, path, 'POST', data, additionalHeaders)
    return resp
  }

  async putData (host, path, data, additionalHeaders = {}) {
    return await this._call(host, path, 'PUT', data, additionalHeaders)
  }

  async deleteData (host, path, additionalHeaders = {}) {
    return await this._call(host, path, 'DELETE', null, additionalHeaders)
  }
}

HttpPlugin.install = (Vue, options = {}) => {
  options.accessTokenCallback = Vue.prototype.$auth.getTokenSilently
  Vue.prototype.$http = new HttpPlugin(options)
}

export { HttpPlugin, HttpError }
