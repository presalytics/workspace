<template>
  <v-app>
    <template v-if="isLoading">
      <preloader />
    </template>
    <template v-else-if="!isAuthenticated">
      <login />
    </template>
    <template v-else>
      <app-bar />

      <drawer />

      <core-view />

      <settings />
    </template>
    <notifications />
  </v-app>
</template>

<script>
  import Preloader from './components/presalytics/Preloader.vue'
  import Login from './components/presalytics/Login.vue'
  import {userWorker, eventWorker, storyWorker} from './store'
  import AppBar from './views/components/AppBar.vue'
  import Drawer from './views/components/Drawer.vue'
  import Settings from './views/components/Settings.vue'
  import View from './views/components/View.vue'
  export default {
    name: 'App',
    components: {
      AppBar,
      Drawer,
      Settings,
      coreView: View,
      Preloader,
      Login
    },
    data () {
      return {
        isResetting: false,
      }
    },
    computed: {
      accessToken() {
        return this.$store.getters.accessToken
      },
      userId() {
        return this.$store.getters.userId
      },
      isLoading() {
        return this.$store.getters['auth/isLoading']
      },
      isAuthenticated() {
        return this.$store.getters['auth/isAuthenticated']
      }
    },
    watch: {
      userId(newValue) {
        if (newValue) {
          this.$store.dispatch('stories/initStories')
          this.$store.dispatch('apiEvents/initEvents', this.userId)
          this.$store.dispatch('users/initUsers')
        }
      }
    },

    created() {

      userWorker.addEventListener('message', function(e) {
        if (e.data.type === 'REFRESH_AUTH') {
          this.refreshAuth()
        } else {
          this.$store.commit('users/' + e.data.type, e.data.payload)
        }
      })

      eventWorker.addEventListener('message', function(e) {
        if (e.data.type === 'REFRESH_AUTH') {
          this.refreshAuth()
        } else {
          this.$store.commit('apiEvents/' + e.data.type, e.data.payload)
        }
      })

      storyWorker.addEventListener('message', function(e) {
        if (e.data.type === 'REFRESH_AUTH') {
          this.refreshAuth()
        } else {
          this.$store.commit('stories/' + e.data.type, e.data.payload)
          if (e.data.type === 'UPDATE_WORKSPACE') {
            this.$store.dispatch('stories/syncIds', e.data.payload)
          }
        }
      })

      this.$auth.init()
    },
    methods: {
      async refreshAuth() {
        var accessToken = await this.$auth.getTokenSilently()
        var message = {accessToken: accessToken}
        userWorker.postMessage(message)
        eventWorker.postMessage(message)
        storyWorker.postMessage(message)
      }
    }
  }
</script>
