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

class HttpPlugin {
  constructor (options = {}) {
    this.hosts = {
      story: options.storyHost || storyHost,
      site: options.siteHost || siteHost,
      ooxmlAutomation: options.ooxmlAutomationHost || ooxmlAutomationHost,
      api: options.workspaceApiHost || workspaceApiHost,
    }
    this._use_csrf = options.use_csrf || true
    this._base_headers = {}
    this._base_headers['Content-Type'] = 'application/json'
    this._base_options = {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      redirect: 'manual',
      referrerPolicy: 'no-referrer',
    }
  }

  _getHeaders (host) {
    var headers = this._base_headers
    if (this._use_csrf) {
      var csrf = Cookies.get('csrftoken')
      if (host === this.hosts.api && csrf) {
        headers['X-CSRFToken'] = csrf
      }
    }
    return headers
  }

  async _handleResponse (response) {
    if (response.status === 204) {
      return 'success'
    } else if (response.ok === 200) {
      return await response.json()
    } else {
      var message = 'An error occured while fetching data'
      var statusCode = response.status_code
      try {
        var errInfo = await response.json()
        message = errInfo.message
      } catch (err) {
        console.error(err)
      }
      var fetchError = new Error('fetch_error')
      fetchError.message = message
      fetchError.status_code = statusCode
      throw fetchError
    }
  }

  async _call (host, path, method, data = null, additionalHeaders = {}) {
    const headers = {
      ...this._getHeaders(host),
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
    return await this._call(host, path, 'GET', null, additionalHeaders)
  }

  async postData (host, path, data, additionalHeaders = {}) {
    return await this._call(host, path, 'POST', data, additionalHeaders)
  }

  async putData (host, path, data, additionalHeaders = {}) {
    return await this._call(host, path, 'PUT', data, additionalHeaders)
  }

  async deleteData (host, path, additionalHeaders = {}) {
    return await this._call(host, path, 'DELETE', null, additionalHeaders)
  }
}

HttpPlugin.install = (Vue, options = {}) => {
  Vue.$http = new HttpPlugin(options)
}

export default { HttpPlugin }
