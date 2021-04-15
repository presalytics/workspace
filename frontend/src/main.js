// =========================================================
// * Vuetify Material Dashboard - v2.1.0
// =========================================================
//
// * Product Page: https://www.creative-tim.com/product/vuetify-material-dashboard
// * Copyright 2019 Creative Tim (https://www.creative-tim.com)
//
// * Coded by Creative Tim
//
// =========================================================
//
// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/base'
import './plugins/chartist'
import './plugins/vee-validate'
import { HttpPlugin } from './plugins/http'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import { Auth0Plugin } from './plugins/auth0'

const authOptions = {
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  client_id: process.env.VUE_APP_AUTH0_CLIENT_ID,
  useRefreshTokens: true,
  audience: process.env.VUE_APP_AUTH0_AUDIENCE,
  scope: process.env.VUE_APP_AUTH0_SCOPE,
}

Vue.use(Auth0Plugin, {
  ...authOptions,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname,
    )
  },
})

Vue.use(HttpPlugin)

Vue.config.productionTip = false

export default new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')
