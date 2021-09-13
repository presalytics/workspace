import Vue from 'vue'
import createAuth0Client from '@auth0/auth0-spa-js'
import store from '../store'

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
        accessToken: null,
      }
    },
    /** Use this lifecycle method to instantiate the SDK client */
    async created () {
      // eslint-disable-next-line
      this.auth0Client = await new createAuth0Client({
        ...options,
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
          onRedirectCallback(appState)
        }
      } catch (e) {
        this.error = e
      } finally {
        // Initialize our internal authentication state
        await this.postRedirectCallback()
      }
    },
    methods: {
      async postRedirectCallback () {
        this.isAuthenticated = await this.auth0Client.isAuthenticated()
        if (this.isAuthenticated) {
          this.user = await this.auth0Client.getUser()
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
      /** Logs the user out and removes their session on the authorization server */
      async logout () {
        store.dispatch('sendToken', null)
        store.dispatch('reset')
        await this.auth0Client.logout({
            returnTo: window.location.origin,
            localonly: true,
            clientId: this.clientId,
        })
        this.isAuthenticated = false
      },
      /** Creates Redirect Uri that bounces off Presalytics.io main site. Allows app to run on custom IPs and locahost **/
      getRedirectUri (o) {
        const callbackUri = o.redirect_uri + '?returnTo=' + encodeURIComponent(window.location.origin)
        return callbackUri
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
