<template>
  <v-container
    id="story-view-main"
    fluid
    class="story-view-container"
  >
    <v-card
      tile
      elevation="5"
      class="drawer"
    >
      <v-navigation-drawer
        v-model="slidePanel"
        permanent
        :mini-variant-width="minifiedPanelWidth"
        :mini-variant.sync="slidesPanelIsMini"
        :width="slidesPanelOpenWidth"
      >
        <v-list-item
          class="px-2"
        >
          <v-btn
            icon
            text
            color="primary"
            @click="handleSlidePanelToggle"
          >
            <v-icon>mdi-slide</v-icon>
          </v-btn>
          <v-list-item-title>Slides</v-list-item-title>
          <v-btn
            icon
            text
            color="primary"
            @click.stop="handleSlidePanelToggle"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-divider />
        <p-slide-list
          :story-id="$route.params.storyId"
        />
      </v-navigation-drawer>
    </v-card>
    <div class="center-item">
      <v-card
        tile
        elevation="5"
      >
        <v-card-title>{{ title }}</v-card-title>
      </v-card>
      <v-card
        tile
        elevation="5"
        class="story-view-panel"
      >
        <story-viewer
          :story-id="$route.params.storyId"
        />
      </v-card>
      <v-card
        tile
        elevation="5"
        class="story-work-panel"
      >
        <v-card-title>Story Work Panel</v-card-title>
        <v-card-text>We'll put some metadata here</v-card-text>
      </v-card>
    </div>
    <v-card
      id="action-panel-card"
      tile
      elevation="5"
      class="drawer"
    >
      <v-navigation-drawer
        v-model="actionPanel"
        permanent
        right
        :mini-variant-width="minifiedPanelWidth"
        :mini-variant.sync="actionPanelIsMini"
        :width="actionPanelOpenWidth"
      >
        <v-list-item
          class="px-2"
        >
          <v-btn
            icon
            text
            color="primary"
            @click="handleActionPanelToggle"
          >
            <v-icon v-if="actionPanelIsMini">
              mdi-auto-fix
            </v-icon>
            <v-icon v-else>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-list-item-title>Actions</v-list-item-title>
          <v-btn
            icon
            color="primary"
            text
            @click.stop="handleActionPanelToggle"
          >
            <v-icon>mdi-auto-fix</v-icon>
          </v-btn>
        </v-list-item>
        <v-divider />
        Actions Accordion
      </v-navigation-drawer>
    </v-card>
  </v-container>
</template>

<script>

  import StoryViewer from '@/components/presalytics/Viewer/StoryViewer.vue'
  import PSlideList from '@/components/presalytics/PSlideList.vue'
  import { v4 as uuidv4 } from 'uuid'
  
  export default {
    name: 'StoryView',
    components: {
      StoryViewer,
      PSlideList,
    },
    data: () => ({
      minifiedPanelWidth: '60px',
      slidesPanelIsMini: true,
      slidePanel: true,
      slidesPanelOpenWidth: '200px',
      actionPanelIsMini: true,
      actionPanel: true,
      actionPanelOpenWidth: '350px',
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
      handleSlidePanelToggle () {
        this.slidesPanelIsMini = !this.slidesPanelIsMini
      },
      handleActionPanelToggle () {
        this.actionPanelIsMini = !this.actionPanelIsMini
      },
      toggleFullscreen() {
        
      },
      getSessionActivityModel() {
        return {
          isVisible: this.visbility,
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
      }
    },
  }
</script>

<style lang="sass" scoped>
  .story-view-container
    min-height: calc(100vh - 75px)
    display: flex
    flex-direction: row
    align-items: flex-start
  .drawer
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    flex-shrink: 1
  .center-item
    flex-grow: 1
    padding-right: 1rem
    padding-left: 1rem
  .story-view-panel
    width: 100%
    margin-top: 1rem
  .story-work-panel
    width: 100%
    margin-top: 1rem
</style>
