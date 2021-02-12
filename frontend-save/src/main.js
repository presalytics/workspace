import '@babel/polyfill'
import 'mutationobserver-shim'
import 'es6-promise/auto'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import router from './router'
import store from './store'
import {Auth0Plugin} from './plugins/auth0'
import App from './App.vue'
import './scss/app.scss'

Vue.use(BootstrapVue)

const authOptions = {
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  client_id: process.env.VUE_APP_AUTH0_CLIENT_ID,
  useRefreshTokens: true,
  audience: process.env.VUE_APP_AUTH0_AUDIENCE,
  scope: process.env.VUE_APP_AUTH0_SCOPE
}

Vue.use(Auth0Plugin, {
    ...authOptions,
    onRedirectCallback: appState => {
      router.push(
        appState && appState.targetUrl
          ? appState.targetUrl
          : window.location.pathname
      );
    },
})

Vue.config.productionTip = false

console.log("Application Configured.  Mounting to Index..")

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
