<template>
  <div id="app">
    <div v-if="$auth.isAuthenticated">
      <div id="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/about">About</router-link>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">

</style>
