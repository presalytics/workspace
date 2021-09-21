import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/views/dashboard/Index.vue'),
      children: [
        // Dashboard
        {
          name: 'Dashboard',
          path: '',
          component: () => import('@/views/dashboard/Dashboard.vue'),
        },
        // Pages
        {
          name: 'Target Audience',
          path: 'audience',
          component: () => import('@/views/dashboard/presalytics/Audience.vue'),
        },
        {
          name: 'Stories',
          path: 'stories',
          component: () => import('@/views/dashboard/presalytics/Stories.vue'),
        },
        {
          name: 'Notifications',
          path: 'components/notifications',
          component: () => import('@/views/dashboard/component/Notifications.vue'),
        },
        {
          name: 'Events',
          path: 'events',
          component: () => import('@/views/dashboard/presalytics/Events.vue'),
        },
        {
          name: 'Story View',
          path: 'stories/view/:storyId',
          component: () => import('@/views/dashboard/presalytics/StoryView.vue'),
        },
        // {
        //   name: 'Typography',
        //   path: 'components/typography',
        //   component: () => import('@/views/dashboard/component/Typography'),
        // },
        // // Tables
        // {
        //   name: 'Regular Tables',
        //   path: 'tables/regular-tables',
        //   component: () => import('@/views/dashboard/tables/RegularTables'),
        // },
        // // Maps
        // {
        //   name: 'Google Maps',
        //   path: 'maps/google-maps',
        //   component: () => import('@/views/dashboard/maps/GoogleMaps'),
        // },
      ],
    },
  ],
})

export default router
