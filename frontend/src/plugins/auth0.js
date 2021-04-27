import Vue from 'vue'
import { Auth0Client } from '@auth0/auth0-spa-js'
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode'
import Cookies from 'js-cookie'
import store from '../store'

export default class ApiSessionManager {
  constructor (options = {}) {
    this.workspaceApiUrl = process.env.VUE_APP_WORKSPACE_API_URL
    if (!(this.workspaceApiUrl.endsWith('/'))) {
      this.workspaceApiUrl += '/'
    }
    this.csrf = null
    this.sessionId = null
    this.timeout_seconds = options.timeout || 5
    this.frame = null
  }

  async initializeSession () {
    var authResult = await Promise.race([
      this.getAuthResultFromIFrame(),
      this.timeoutTrigger(),
    ])
    this.removeIFrame()

    if (authResult.error) {
      throw authResult.error
    }

    this.sessionId = authResult.sessionId
    this.csrf = authResult.csrf
  }

  async timeoutTrigger () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var err = new Error('login_required')
        err.error = 'login_required'
        err.message = 'Get Server Session Timeout.  Prompt for Login'
        reject(err)
      }, this.timeout_seconds * 1000)
    })
  }

  async getAuthResultFromIFrame () {
    this.injectIFrame()
    return new Promise((resolve) => {
      var that = this
      window.addEventListener('message', function handlePostMessage (e) {
        if (e.origin === that.getWorkspaceApiOrigin() && e.data.sessionId) {
          window.removeEventListener('message', handlePostMessage)
          resolve(e.data)
        }
      })
    })
  }

  injectIFrame () {
    var body = document.querySelector('body')
    var frame = document.createElement('iframe')
    var sessionUrl = this.workspaceApiUrl + 'user/session/'
    frame.setAttribute('src', sessionUrl)
    frame.setAttribute('height', 0)
    frame.setAttribute('width', 0)
    frame.setAttribute('style', 'height:0; width: 0;')
    body.appendChild(frame)
    this.frame = frame
  }

  removeIFrame () {
    const body = document.querySelector('body')
    body.removeChild(this.frame)
    this.frame = null
  }

  getWorkspaceApiOrigin () {
    return new URL(this.workspaceApiUrl).origin
  }

  getHeaders () {
    const headers = {}
    this.csrf = Cookies.get('csrftoken') || this.csrf
    if (this.csrf) {
      headers['X-CSRFToken'] = this.csrf
    }
    return headers
  }

  async logout () {
    if (this.sessionId) {
      const headers = this.getHeaders()
      const url = this.workspaceApiUrl + 'user/session/'
      const response = await fetch(url, {
        headers: headers,
        method: 'DELETE',
        mode: 'cors',
        credentials: 'include',
        cache: 'no-cache',
        redirect: 'manual',
      })
      if (response.status === 200) {
        var data = await response.json()
        return data
      } else {
        return null
      }
    }
  }

  async updateSession (sessionData) {
    if (this.sessionId) {
      const headers = this.getHeaders()
      headers['Content-Type'] = 'application/json'
      headers.Authorization = 'Bearer ' + sessionData.access_token
      const url = this.workspaceApiUrl + 'user/session/'
      const response = await fetch(url, {
        headers: headers,
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        cache: 'no-cache',
        redirect: 'manual',
        body: JSON.stringify(sessionData),
        referrer: location.origin,
      })
      if (response.ok) {
        if (response.status === 200) {
          var resData = await response.json()
          return resData
        } else {
          return null
        }
      } else {
        throw new Error(response)
      }
    }
  }
}

/** Define a default action to perform after authentication */
const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname)

let instance

/** Returns the current instance of the SDK */
export const getInstance = () => instance

/** Creates an instance of the Auth0 SDK. If one has already been created, it returns that instance */
export const useAuth0 = ({
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  ...options
}) => {
  if (instance) return instance

  // The 'instance' is simply a Vue object
  instance = new Vue({
    data () {
      return {
        loading: true,
        isAuthenticated: false,
        user: {},
        auth0Client: null,
        popupOpen: false,
        error: null,
        apiSessionMgr: null,
        accessToken: null,
      }
    },
    /** Use this lifecycle method to instantiate the SDK client */
    async created () {
      this.auth0Client = await new Auth0Client({
        ...options,
        redirect_uri: window.location.origin,
      })
      this.apiSessionMgr = new ApiSessionManager()
      var stateActive = store.getters.accessToken && Cookies.get('csrftoken') && store.getters.me
      var tokenValid = false
      try {
        var decoded = jwt_decode(store.getters.accessToken)
        var currentTimePlus1hr = new Date().getTime() / 1000 + 3600
        tokenValid = currentTimePlus1hr < decoded.exp
      } catch {
        // eslint-disable-next-line
        console.log('Invalid access token.  Running synchronous startup')
      }
      if (stateActive && tokenValid) {
        this.initialize().then(() => this.postRedirectCallback())
        store.dispatch('sendToken', store.getters.accessToken, Cookies.get('csrftoken'))
        this.loading = false
        this.isAuthenticated = true
      } else {
        await this.initialize()
      }
      try {
        // If the user is returning to the app after authentication..
        if (
          window.location.search.includes('code=') &&
          window.location.search.includes('state=')
        ) {
          // handle the redirect and retrieve tokens
          const { appState } = await this.auth0Client.handleRedirectCallback()

          this.error = null

          // Notify subscribers that the redirect callback has happened, passing the appState
          // (useful for retrieving any pre-authentication state)
          onRedirectCallback(appState)
        }
      } catch (e) {
        this.error = e
      } finally {
        // Initialize our internal authentication state
        if (!stateActive || !tokenValid) {
          await this.postRedirectCallback()
        }
      }
    },
    methods: {
      async initialize () {
        try {
          this.accessToken = await this.auth0Client.getTokenSilently()
          await this.apiSessionMgr.initializeSession()
          this.ifErrorThrow()
        } catch (err) {
          this.error = err
          if (err.error === 'login_required') {
            this.logout()
          }
        }
      },
      async postRedirectCallback () {
        this.isAuthenticated = await this.auth0Client.isAuthenticated()
        if (this.isAuthenticated) {
          this.user = await this.auth0Client.getUser()
          this.apiSessionMgr.updateSession({ access_token: this.accessToken })
          store.dispatch('auth/setAuthorization', {
            token: this.accessToken,
            user: this.user,
          })
        }
        this.loading = false
      },
      /** Authenticates the user using a popup window */
      async loginWithPopup (options, config) {
        this.popupOpen = true

        try {
          await this.auth0Client.loginWithPopup(options, config)
          this.user = await this.auth0Client.getUser()
          this.isAuthenticated = await this.auth0Client.isAuthenticated()
          this.error = null
        } catch (e) {
          this.error = e
          // eslint-disable-next-line
          console.error(e);
        } finally {
          this.popupOpen = false
        }

        this.user = await this.auth0Client.getUser()
        this.isAuthenticated = true
      },
      /** Handles the callback when logging in using a redirect */
      async handleRedirectCallback () {
        this.loading = true
        try {
          await this.auth0Client.handleRedirectCallback()
          this.user = await this.auth0Client.getUser()
          this.isAuthenticated = true
          this.error = null
        } catch (e) {
          this.error = e
        } finally {
          this.loading = false
        }
      },
      /** Authenticates the user using the redirect method */
      loginWithRedirect () {
        return this.auth0Client.loginWithRedirect(this.auth0Client.options)
      },
      /** Returns all the claims present in the ID token */
      getIdTokenClaims (o) {
        return this.auth0Client.getIdTokenClaims(o)
      },
      /** Returns the access token. If the token is invalid or missing, a new one is retrieved */
      async getTokenSilently (o) {
        this.accessToken = await this.auth0Client.getTokenSilently(o)
        this.apiSessionMgr.updateSession({ access_token: this.accessToken })
        store.dispatch('auth/setAuthorization', {
          token: this.accessToken,
          user: this.user,
        })
        return this.accessToken
      },
      /** Gets the access token using a popup window */

      async checkSession (o) {
        return await this.auth0Client.checkSession(o)
      },

      getTokenWithPopup (o) {
        return this.auth0Client.getTokenWithPopup(o)
      },
      async updateApiToken (o) {
        // pushes token to server-side cache
        return await this.apiSessionMgr.updateSession({ access_token: this.accessToken })
      },
      /** Logs the user out and removes their session on the authorization server */
      async logout () {
        store.dispatch('sendToken', null)
        store.dispatch('reset')
        await Promise.all([
          this.apiSessionMgr.logout(),
          this.auth0Client.logout({
            returnTo: window.location.origin,
            localOnly: true,
            clientId: this.clientId,
          }), // set localOnly to false if you want to log use out of main website too.
        ])
        this.isAuthenticated = false
      },
      /** Creates Redirect Uri that bounces off Presalytics.io main site. Allows app to run on custom IPs and locahost **/
      getRedirectUri (o) {
        const callbackUri = o.redirect_uri + '?returnTo=' + encodeURIComponent(window.location.origin)
        return callbackUri
      },
      ifErrorThrow () {
        if (this.error) {
          throw this.error
        }
      },
    },
  })

  return instance
}

// Create a simple Vue plugin to expose the wrapper object throughout the application
export const Auth0Plugin = {
  install (Vue, options) {
    Vue.prototype.$auth = useAuth0(options)
  },
}
