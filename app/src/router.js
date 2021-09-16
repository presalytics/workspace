import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./App.vue'),
      children: [
        // Dashboard
        {
          name: 'Dashboard',
          path: '',
          component: () => import('./views/Dashboard.vue'),
        },
        // Pages
        {
          name: 'Target Audience',
          path: 'audience',
          component: () => import('./views/presalytics/Audience.vue'),
        },
        {
          name: 'Stories',
          path: 'stories',
          component: () => import('./views/presalytics/Stories.vue'),
        },
        {
          name: 'Notifications',
          path: 'components/notifications',
          component: () => import('./views/presalytics/Notifications.vue'),
        },
        {
          name: 'Events',
          path: 'events',
          component: () => import('./views/presalytics/Events.vue'),
        },
        {
          name: 'Story View',
          path: 'stories/view/:storyId',
          component: () => import('./views//presalytics/StoryView.vue'),
        },
        // {
        //   name: 'Typography',
        //   path: 'components/typography',
        //   component: () => import('./views/dashboard/component/Typography'),
        // },
        // // Tables
        // {
        //   name: 'Regular Tables',
        //   path: 'tables/regular-tables',
        //   component: () => import('./views/dashboard/tables/RegularTables'),
        // },
        // // Maps
        // {
        //   name: 'Google Maps',
        //   path: 'maps/google-maps',
        //   component: () => import('./views/dashboard/maps/GoogleMaps'),
        // },
      ],
    },
  ],
})

export default router
