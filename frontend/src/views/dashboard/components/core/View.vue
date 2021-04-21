<template>
  <v-content>
    <router-view />

    <dashboard-core-footer />
  </v-content>
</template>

<script>
  export default {
    name: 'DashboardCoreView',

    components: {
      DashboardCoreFooter: () => import('./Footer'),
    },
    async created () {
      await Promise.all([
        this.$store.dispatch('stories/initStories'),
        this.$store.dispatch('users/initUsers'),
        this.$store.dispatch('apiEvents/initEvents'),
      ])
    },
  }
</script>
