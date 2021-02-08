<template>
  <div class="home">
    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="!$auth.loading">
      <!-- show login when not authenticated -->

      <div v-if="!$auth.isAuthenticated">
        <div class="d-flex justify-content-center h-100 align-items-center flex-column full-page">
          <div class="d-flex justify-content-center">
            <img alt="Presalytics Logo" class="logo-container" src="../assets/transparent_logo.png" />
          </div>
          <div class="d-flex justify-content-center">
            <button @click="login" class="btn btn-primary">Log in</button>
          </div>
        </div>
      </div>
      <!--  Load Workspace When Authenticated -->
      <div v-if="$auth.isAuthenticated">
        <button v-if="$auth.isAuthenticated" @click="logout">Log out</button>
        <Workspace />
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Workspace from '@/components/Workspace.vue'

export default {
  name: 'Home',
  components: {
    Workspace
  },
  computed: {
    isRegistered() {
      return this.$store.state.workspace.agentId ? true : false
    },
    isAuthenticated() {
      return this.$auth.isAuthenticated
    },
    user() {
      return this.$auth.user;
    },
    auth() {
      return this.$auth;
    },
    logoutUri() {
      return this.$auth.auth0Client.options.redirect_uri
    }
  },
  methods: {
    // Log the user in
    login() {
      this.$auth.loginWithRedirect();
    },
    // Log the user out
    logout() {
      this.$auth.logout({
        returnTo: this.logoutUri
      });
    }
  }
}
</script>

<style scoped>
.logo-container {
  max-width: 60vw;
}
.full-page {
  min-height: 100vh !important;
}
</style>
