import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import SecureLS from 'secure-ls'
import auth from './auth'

Vue.use(Vuex)

const ls = new SecureLS({ encodingType: 'AES', encryptionSecret: process.env.VUE_APP_ENCRYPTION_KEY })

const vuexLocal = new VuexPersistence({
  key: 'vuex',
  saveState: (key, state, storage) => {
    ls.set(key, state)
  },
  restoreState: (key, storage) => {
    return ls.get(key)
  },
})

export default new Vuex.Store({
  state: {
    barColor: 'rgba(0, 0, 0, .8), rgba(0, 0, 0, .8)',
    barImage: 'https://demos.creative-tim.com/material-dashboard/assets/img/sidebar-1.jpg',
    drawer: null,
  },
  mutations: {
    SET_BAR_IMAGE (state, payload) {
      state.barImage = payload
    },
    SET_DRAWER (state, payload) {
      state.drawer = payload
    },
  },
  actions: {

  },
  modules: {
    auth,
  },
  plugins: [vuexLocal.plugin],
})
