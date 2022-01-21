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

        <v-footer
          id="workspace-footer"
          padless
          absolute
          height="65px"
        >
          <v-toolbar
            id="footer-toolbar"
            dense
            class="my-0 mx-0 py-0 px-0"
            height="65px"
            elevation="0"
          >
            <v-toolbar-title>
              Page Name
            </v-toolbar-title>
            <v-spacer />
            Zoom Bar
          </v-toolbar>
        </v-footer>
      </v-container>
    </div>
  </v-container>
</template>

<script>

  import StoryViewer from '@/components/presalytics/Viewer/StoryViewer.vue'
  import ActionPanel from './ActionPanel.vue'
  import SlidePanel from './SlidePanel.vue'
  import ExpansionPanel from './ExpansionPanel.vue'
  import ViewerToolbar from './ViewerToolbar.vue'
  import { v4 as uuidv4 } from 'uuid'
  
  export default {
    name: 'StoryViewApp',
    components: {
      StoryViewer,
      SlidePanel,
      ViewerToolbar,
      ActionPanel,
      ExpansionPanel
    },
    props: {
      storyId: {
        type: String,
        required: true
      }
    },
    data: () => ({
      actionPanel: {
        name: 'actionPanel',
        isMini: true,
        defaultOpenWidth: '350px',
        minifiedPanelWidth: '60px',
        width: '60px',
        open: false,
        direction: 'right'
      },
      expansionPanel: {
        name: 'expansionPanel',
        open: false,
        defaultOpenWidth: '350px',
        defaultClosedWidth: '0px',
        direction: 'right',
        docked: true
      },
      borderWidth: '3px',
      sessionMetrics: {}
    }),
    computed: {
      isBuilder () {
        return true
      },
      story () {
        return this.$store.getters['stories/story'](this.$route.params.storyId)
      },
      title () {
        if (this.story) {
          return this.story.title
        } else {
          return ''
        }
      },
      visibility() {
        return this.$store.getters.visbility
      },
      userId() {
        return this.$store.getters.userId
      }
    },
    watch: {
      visibility(isVisible) {
        if (isVisible) {
          this.sessionMetrics.activeStartTime = Date.now()
          let sessionActivityModel = this.getSessionActivityModel() 
          this.$dispatcher.emit('story.view_session_active', sessionActivityModel)
        } else {
          this.setSessionActiveTime()
          let sessionActivityModel = this.getSessionActivityModel()
          this.$dispatcher.emit('story.view_session_inactive', sessionActivityModel)
        }
      }
    },
    mounted() {
      this.sessionMetrics.sessionStartTime = Date.now()
      this.sessionMetrics.activeStartTime = Date.now()
      this.sessionMetrics.sessionId = uuidv4().toString()
      this.sessionMetrics.activeTime = 0
      this.$dispatcher.emit("story.view_session_started", this.getSessionActivityModel())
    },
    beforeDestroy() {
      this.setSessionActiveTime()
      this.$dispatcher.emit("story.view_session_ended", this.getSessionActivityModel())
    },
    methods: {
      getSessionActivityModel() {
        return {
          isVisible: this.visibility,
          resourceId: this.story.id,
          id: this.story.id,
          sessionId: this.sessionMetrics.sessionId,
          currentTime: Date.now(),
          sessionStartTime: this.sessionMetrics.sessionStartTime,
          sessionActiveTime: this.sessionMetrics.activeTime,
          userId: this.userId
        }
      },
      setSessionActiveTime() {
        let activeMillisecondsToAdd = Date.now() - this.sessionMetrics.activeStartTime
        this.sessionMetrics.activeTime += activeMillisecondsToAdd
        this.sessionMetrics.activeStartTime = Date.now()
      },
    },
  }
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
