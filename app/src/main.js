import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/chartist'
import './plugins/vee-validate'
import http from './plugins/http'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import auth from './plugins/auth0'
import { ErrorHandler } from './plugins/errorHandler'
import dispatcher from './plugins/dispatcher'

const authOptions = {
  domain: import.meta.env.VITE_APP_AUTH0_DOMAIN,
  client_id: import.meta.env.VITE_APP_AUTH0_CLIENT_ID,
  useRefreshTokens: true,
  audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
  scope: import.meta.env.VITE_APP_AUTH0_SCOPE,
}

Vue.use(auth, {
  ...authOptions,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname,
    )
  },
  storeDispatchFn: store.dispatch
})

Vue.use(http, {authGetTokenFn: () => store.getters.accessToken})
Vue.use(ErrorHandler)
Vue.use(dispatcher, {
  storeDispatchFn: store.dispatch,
  userIdFn: () => store.getters.userId
})

Vue.config.productionTip = false
Vue.config.devtools = true

export default new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')
