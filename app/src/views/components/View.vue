<template>
  <div>
    <router-view />

    <dashboard-core-footer />
  </div>
</template>

<script>
  import { defineAsyncComponent } from 'vue'
  export default {
    name: 'DashboardCoreView',

    components: {
      DashboardCoreFooter: defineAsyncComponent(() => import('./Footer.vue')),
    },
  }
</script>
