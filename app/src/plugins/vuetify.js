import Vue from 'vue'
import Vuetify from 'vuetify/'
// TODO: Figure out why VuetifyResolver is not working from unplugin-vue-components
// The whole Vueity package is getting imported, which will slow down load times
import i18n from '@/i18n'
import '@/sass/overrides.sass'

Vue.use(Vuetify)

const theme = {
  primary: '#199ec7',
  secondary: '#fcb410',
  accent: '#6f42c1',
  info: '#9ec719',
  success: '#40bc86',
  error: '#ec555c',
  warning: '#ffc107',
}

export default new Vuetify({
  lang: {
    t: (key, ...params) => i18n.t(key, params),
  },
  theme: {
    themes: {
      dark: theme,
      light: theme,
    },
    options: {
      customProperties: true,
      variations: true,
    },
  },
})
