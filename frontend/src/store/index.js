import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

//import workspace from './modules/workspace'



const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  // modules: {
  //     workspace
  // },
  strict: debug,
  //plugins: debug ? [createLogger()] : []
})