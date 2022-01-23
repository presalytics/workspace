import { mapActions } from 'vuex'

export default{
  props: {
    storyId: {
      type: String,
      required: true
    }
  },
  computed: {
    appState() {
      return this.$store.getters['storyviewer/appState'](this.storyId)
    },
    activePage() {
      return this.appState.activePage
    }
  },
  methods: {
    ...mapActions('storyviewer', ['updateAppState'])
  }
}