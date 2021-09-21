<template>
  <div class="d-flex justify-center h-100 align-center flex-column full-page">
    <div class="d-flex justify-content-center">
      <img
        alt="Presalytics Logo"
        class="logo-container"
        src="../../assets/transparent_logo.png"
      >
    </div>
    <div class="d-flex justify-center">
      <v-btn
        class="btn btn-primary"
        color="success"
        @click="login"
      >
        Log in
      </v-btn>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    methods: {
      // Log the user in
      login () {
        this.$auth.loginWithRedirect()
      },
    },
  }
</script>

<style lang="sass">
    .logo-container
        max-width: 60vw
    .full-page
        min-height: 100vh !important
</style>
