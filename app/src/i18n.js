import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from 'vuetify/lib/locale/en'

Vue.use(VueI18n)

const messages = {
  en: {
    $vuetify: en,
  },
}

export default new VueI18n({
  locale: import.meta.env.VITE_APP_I18N_LOCALE || 'en',
  fallbackLocale: import.meta.env.VITE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages,
})
