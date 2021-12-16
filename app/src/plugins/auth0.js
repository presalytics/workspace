import createAuth0Client from '@auth0/auth0-spa-js'
import { CloudEvent } from 'cloudevents'
import { v4 as uuidv4 } from 'uuid'


let instance = null

export default class Auth0Plugin{
  constructor(options) {
    this.loading =true,
    this.isAuthenticated = false,
    this.user =  {},
    this.auth0Client = null,
    this.error = null,
    this.accessToken = null,
    this.onRedirectCallback = options.onRedirectCallback
    this.clientOptions = options
    this.storeDispatchFn = options.storeDispatchFn || null
  }

  static install(Vue, options = {}) {
    if (instance) {
      return instance
    } else {
      instance = new Auth0Plugin(options)
    }
    Vue.prototype.$auth = instance
  }
  async init (options = {}) {
    // eslint-disable-next-line
    this.loading = true
    if (this.storeDispatchFn) this.storeDispatchFn('auth/toggleLoading')
    const opts = {
      ...this.clientOptions,
      ...options
    }
    this.auth0Client = await new createAuth0Client({
      ...opts,
      cacheLocation: 'localstorage',
      redirect_uri: window.location.origin,
    })
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
      
        this.onRedirectCallback(appState)
      }
    } catch (e) {
      this.error = e
    } finally {
      // Initialize our internal authentication state
      await this.postRedirectCallback()
    }
  }
  async postRedirectCallback () {
    this.isAuthenticated = await this.auth0Client.isAuthenticated()
    if (this.isAuthenticated) {
      this.user = await this.auth0Client.getUser()
      this.sendUserEvent('user.login')
      await this.getTokenSilently()
      if (this.storeDispatchFn) {
        this.storeDispatchFn('auth/setAuthorization', {
          accessToken: this.accessToken,
          user: this.user
        })
        this.storeDispatchFn('users/updateUser', this.user["https://api.presalytics.io/api_user_id"])
      }

    }
    this.loading = false
    if (this.storeDispatchFn) this.storeDispatchFn('auth/toggleLoading')
  }
  /** Authenticates the user using the redirect method */
  loginWithRedirect () {
    return this.auth0Client.loginWithRedirect(this.auth0Client.options)
  }
  /** Returns all the claims present in the ID token */
  getIdTokenClaims (o) {
    return this.auth0Client.getIdTokenClaims(o)
  }
  /** Returns the access token. If the token is invalid or missing, a new one is retrieved */
  async getTokenSilently (o) {
    this.accessToken = await this.auth0Client.getTokenSilently(o)
    return this.accessToken
  }
  /** Gets the access token using a popup window */

  async checkSession (o) {
    return await this.auth0Client.checkSession(o)
  }

  getTokenWithPopup (o) {
    return this.auth0Client.getTokenWithPopup(o)
  }
  /** Logs the user out and removes their session on the authorization server */
  async logout () {
    this.sendUserEvent('user.logout')
    await this.auth0Client.logout({
        returnTo: window.location.origin,
        localonly: true,
        clientId: this.clientId,
    })
    this.isAuthenticated = false
    this.accessToken = null
    if (this.storeDispatchFn) this.storeDispatchFn('logout')
    
  }
      /** Creates Redirect Uri that bounces off Presalytics.io main site. Allows app to run on custom IPs and locahost **/
  getRedirectUri (o) {
    const callbackUri = o.redirect_uri + '?returnTo=' + encodeURIComponent(window.location.origin)
    return callbackUri
  }

  sendUserEvent(eventType) {
    const userId = this.user.appMetadata?.apiUserId || this.user["https://api.presalytics.io/api_user_id"]
    this.storeDispatchFn('apiEvents/sendEvent',  new CloudEvent({
        type: eventType,
        data: {
          resourceId: userId,
          userId: userId,
        },
        subject: userId,
        time: new Date().toISOString(),
        id: uuidv4(),
        source: window.location.origin,
        datacontenttype: "application/json"
      })
    )
  }
}
