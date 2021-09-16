import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import store from './store'
import router from './router'
import auth0 from './plugins/auth0'
import http from './plugins/http'
import Notifications from '@kyvg/vue3-notification'
import App from './App.vue'

const app = createApp(App)

const authOptions = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
  useRefreshTokens: true,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  scope: import.meta.env.VITE_AUTH0_SCOPE,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname,
    )
  },
}

app.use(vuetify)
app.use(Notifications)
app.use(router)
app.use(store)
app.use(auth0, authOptions)
console.log(app.config.globalProperties.$auth.getTokenSiliently)
app.use(http, {getTokenfn: app.config.globalProperties.$auth.getTokenSiliently})


app.mount('#app')

export default app