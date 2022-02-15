<template>
  <v-container
    id="story-view-main"
    fluid
    class="story-view-container grey-lighten-5"
  >
    <viewer-toolbar 
      :story-id="storyId"
    />
    <div class="workspace-wrapper">
      <v-container
        fluid
        class="align-start py-0 px-0 mx-0 my-0 d-flex flex-row"
      >
        <slide-panel 
          :story-id="storyId" 
        />
        <v-content
          class="workspace-content"
        >
          <v-card
            tile
            elevation="5"
            class="story-view-panel"
          >
            <story-viewer
              :story-id="$route.params.storyId"
            />
          </v-card>
        </v-content>

        <expansion-panel
          :story-id="storyId"
        />

        <action-panel
          :story-id="storyId"
        />

        <viewer-footer
          :story-id="storyId"
        />
      </v-container>
    </div>
  </v-container>
</template>

<script lang="ts">

  import StoryViewer from '@/components/presalytics/Viewer/StoryViewer.vue'
  import ActionPanel from './ActionPanel.vue'
  import SlidePanel from './SlidePanel.vue'
  import ExpansionPanel from './ExpansionPanel.vue'
  import ViewerToolbar from './ViewerToolbar.vue'
  import ViewerFooter from './ViewerFooter.vue'
  import Story from '@/objects/story'
  import StoryOutline from '@/objects/story/story-outline'
  import Vue from 'vue'
  import { mapActions } from 'vuex'
  import SessionMetrics from '@/objects/viewer/session-metrics'
import AppState from '@/objects/viewer/app-state'
  
  export default Vue.extend({
    name: 'StoryViewApp',
    components: {
      StoryViewer,
      SlidePanel,
      ViewerToolbar,
      ActionPanel,
      ExpansionPanel,
      ViewerFooter,
    },
    props: {
      storyId: {
        type: String,
        required: true
      }
    },
    data: () => ({
      sessionMetrics: {} as SessionMetrics,
      defaultAppState: new AppState()
    }),
    computed: {
      AppState: {
        get(): AppState {
          let appState = this.$store.getters['storyviwer/appState'](this.storyId)
          if (!appState) {
            this.initAppState()
            appState = this.defaultAppState
          }
          return appState
        },
      },
      isBuilder(): boolean {
        return true
      },
      story (): Story {
        return this.$store.getters['stories/story'](this.storyId)
      },
      outline(): StoryOutline {
        return this.$store.getters['stories/outline'](this.story.outline)
      },
      title (): string {
        if (this.story) {
          return this.story.title
        } else {
          return ''
        }
      },
      visibility(): boolean {
        return this.$store.getters.visbility
      },
      userId(): string {
        return this.$store.getters.userId
      }
    },
    watch: {
      visibility(isVisible) {
       this.sessionMetrics.setVisibility(isVisible)
      }
    },
    mounted() {
      this.sessionMetrics = new SessionMetrics({
        storyId: this.storyId,
        userId: this.userId
      })
      this.$dispatcher.dispatchApiEvent("story.view_session_started", this.sessionMetrics.jsonify())
    },
    beforeDestroy() {
      this.sessionMetrics.updateActiveTime()
      this.$dispatcher.dispatchApiEvent("story.view_session_ended", this.sessionMetrics.jsonify())
    },
    methods: {
      ...mapActions('storyviewer', ['updateAppState']),
      initAppState() {
        this.updateAppState({
          storyId: this.storyId,
          key: 'activePageIndex',
          value: 0
        }),
        this.updateAppState({
          storyId: this.storyId,
          key: 'expansionPanel',
          value: {
            isOpen: false,
            componentName: ''
          }
        })
      },
    },
  })
</script>

<style lang="sass" scoped>
  .story-view-container
    height: calc(100vh - 75px)
    display: flex
    background: #FAFAFA
    border-top-color: rgba(0, 0, 0, 0.12)
    border-top-width: 1px
    border-top-style: solid
    padding: 0
    flex-direction: column
    align-items: stretch
    position: relative
  .v-navigation-drawer
    height: calc(100vh - 65px - 75px - 96px) !important
  .story-view-panel
    width: 100%
    margin: 0
  .workspace-content
    padding: 15px !important
    height: calc(100vh - 65px - 75px - 96px) !important
    overflow-y: auto
  #workspace-footer
    border-top-style: solid !important
    border-top-width: 1px !important
    border-top-color: rgba(0, 0, 0, 0.12) !important
    padding: 0 !important
    margin: 0 !important


  // save below for panel scrollbars
  
    // body::-webkit-scrollbar-track
  //   -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3)
  //   border-radius: 10px
  //   background-color: #F5F5F5
  // body::-webkit-scrollbar
  //   width: 12px
  //   background-color: #F5F5F5
  // body::-webkit-scrollbar-thumb
  //   border-radius: 10px
  //   -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3)
  //   background-color: #D62929
</style>
