import Vue from 'vue'
import AppState from '@/objects/viewer/app-state'
import ExpansionComponent from '@/objects/viewer/expansion-component'

const initialState = () => ({
  appState: {},
  expansionComponents: [
    {
      icon: 'mdi-chart-bar',
      color: 'primary',
      tooltip: 'Analytics',
      component: 'StoryAnalytics',
      disabled: false,
      title: 'Analytics'
    },
    {
      icon: 'mdi-message',
      color: 'success',
      tooltip: 'Page Comments',
      component: 'PageComments',
      disabled: false,
      title: 'Comments'
    },
    {
      icon: 'mdi-code-tags',
      color: 'accent',
      tooltip: 'Bind a SQL Query',
      component: 'PageSQLEditor',
      disabled: false,
      title: 'SQL'
    },
    {
      icon: 'mdi-bell',
      color: 'error',
      tooltip: 'Notification Settings',
      component: 'StoryNotificationSettings',
      disabled: false,
      title: 'Notifications'
    },
    {
      icon: 'mdi-account-group',
      color: 'secondary',
      tooltip: 'Manage Collaborators',
      component: 'StoryCollaboratorManager',
      disabled: false,
      title: 'Collaborators'
    },
    {
      icon: 'mdi-flash',
      color: 'info',
      tooltip: 'View Story Events',
      component: 'StoryTimeline',
      disabled: false,
      title: 'Events'
    },
  ]
})

export default {
  namespaced: true,
  state: initialState,
  getters: {
    appState: (state) => (storyId) => {
      return state.appState[storyId] ? new AppState(state.appState[storyId]) : null
    },
    expansionComponents: (state) => {
      return state.expansionComponents.map( (cur) => new ExpansionComponent(cur))
    }
  },
  mutations: {
    UPDATE_APP_STATE: (state, payload) => {
      if (!state.appState[payload.storyId]) {
        state.appState[payload.storyId] = {}
      }
      Vue.set(state.appState[payload.storyId], payload.key, payload.value)
    },
    RESET_STATE (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => { state[key] = initial[key] })
    },
  },
  actions: {
    updateAppState( { commit }, payload) {
      if (!payload.key || typeof payload.value !== 'number' || !payload.storyId) {
        throw new Error('action updateAppState requires a payload with a storyId, key, and value properties')
      }
      commit('UPDATE_APP_STATE', payload)
    },
  },
}
