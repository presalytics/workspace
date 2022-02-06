import { mapActions } from 'vuex'
import Vue from 'vue'
import Story from '@/objects/story'
import User from '@/objects/user'
import StoryOutline from '@/objects/story/story-outline'
import AppState from '../../../../objects/viewer/app-state'
import StoryPage from '@/objects/story/story-page'

export default Vue.extend({
  props: {
    storyId: {
      type: String,
      required: true
    }
  },
  computed: {
    story(): Story {
      return this.$store.getters['stories/story'](this.storyId)
    },
    outline(): StoryOutline {
      return this.$store.getters['stories/outline'](this.storyId)
    },
    appState(): AppState {
      return this.$store.getters['storyviewer/appState'](this.storyId) || new AppState()
    },
    activePageId(): string {
      return this.outline.document.pages[this.activePageIndex].id
    },
    activePageIndex(): number {
      return this.appState.activePageIndex
    },
    activePage(): StoryPage {
      return this.outline.document.pages[this.activePageIndex]
    },
    currentUser(): User {
      return this.$store.getters['users/getUser'](this.$store.getters.userId)
    }
  },
  methods: {
    ...mapActions('storyviewer', ['updateAppState']),
    setActivePageIndex(pageIndex: number): void {
      this.updateAppState({
        storyId: this.storyId,
        key: 'activePageIndex',
        value: pageIndex
      })
    },
    toggleExpansionPanel() {
      const panel = {...this.appState.expansionPanel}
      panel.isOpen = !panel.isOpen
      this.updateAppState({
        storyId: this.storyId,
        key: 'expansionPanel',
        value: panel
      })
    }
  },
})