<template>
  <v-app>
    <template v-if="$auth.loading">
      <preloader />
    </template>
    <template v-else-if="!$auth.isAuthenticated">
      <login />
    </template>
    <template v-else>
      <dashboard-core-app-bar />

      <dashboard-core-drawer />

      <dashboard-core-view />

      <dashboard-core-settings />
      <p-alert />
    </template>
  </v-app>
</template>

<script>
  import Preloader from '../../components/presalytics/Preloader.vue'
  import Login from '../../components/presalytics/Login'
  export default {
    name: 'DashboardIndex',

    components: {
      DashboardCoreAppBar: () => import('./components/core/AppBar'),
      DashboardCoreDrawer: () => import('./components/core/Drawer'),
      DashboardCoreSettings: () => import('./components/core/Settings'),
      DashboardCoreView: () => import('./components/core/View'),
      Preloader,
      Login,
      PAlert: () => import('../../components/presalytics/Dialogs/PAlert'),
    },
  }
</script>
