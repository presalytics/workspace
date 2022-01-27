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
      return this.$store.getters['stories/getStory'](this.$props.storyId)
    },
    outline(): StoryOutline {
      return this.$store.getters['store/outline'](this.$props.storyId)
    },
    appState(): AppState {
      return this.$store.getters['storyviewer/appState'](this.$props.storyId)
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
    setActivePage(pageId: string): void {
      this.updateAppState({
        storyId: this.storyId,
        key: 'activePageId',
        value: pageId
      })
    }
  },
})