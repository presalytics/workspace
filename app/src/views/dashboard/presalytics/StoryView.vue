<template>
  <v-container
    id="story-view-main"
    fluid
    class="story-view-container grey-lighten-5"
  >
    <div class="toolbar-wrapper">
      <v-toolbar
        dense
        elevation="0"
        color="gray lighten-4"
      >
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon>
          <v-icon>
            mdi-cards-heart-outline
          </v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
      </v-toolbar>
    </div>
    <div class="workspace-wrapper">
      <v-container
        fluid
        class="align-start py-0 px-0 mx-0 my-0 d-flex flex-row"
      >
        <v-navigation-drawer
          id="slidePanel"
          ref="slidePanel"
          v-model="slidePanel.open"
          permanent
          :mini-variant-width="slidePanel.minifiedPanelWidth"
          :mini-variant.sync="slidePanel.isMini"
          :width="slidePanel.width"
          class="left-nav-drawer"
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

        <v-navigation-drawer
          id="actionPanel"
          ref="actionPanel"
          v-model="actionPanel.open"
          permanent
          right
          :mini-variant-width="actionPanel.minifiedPanelWidth"
          :mini-variant.sync="actionPanel.isMini"
          :width="actionPanel.width"
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
              <v-icon v-if="actionPanel.isMini">
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
      </v-container>
    </div>
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
      slidePanel: {
        name: 'slidePanel',
        isMini: true,
        minifiedPanelWidth: '60px',
        defaultOpenWidth: '200px',
        width: '60px',
        open: false,
        direction: 'left'
      },
      actionPanel: {
        name: 'actionPanel',
        isMini: true,
        defaultOpenWidth: '350px',
        minifiedPanelWidth: '60px',
        width: '60px',
        open: false,
        direction: 'right'
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
      this.setDraggableBorders()
      this.setDrawerEvents(this.slidePanel)
      this.setDrawerEvents(this.actionPanel)
    },
    beforeDestroy() {
      this.setSessionActiveTime()
      this.$dispatcher.emit("story.view_session_ended", this.getSessionActivityModel())
    },
    methods: {
      handleSlidePanelToggle () {
        this.slidePanel.isMini = !this.slidePanel.isMini
        if (!this.slidePanel.isMini) {
          this.slidePanel.width = this.slidePanel.defaultOpenWidth
        }
      },
      handleActionPanelToggle () {
        this.actionPanel.isMini = !this.actionPanel.isMini
        if (!this.actionPanel.isMini) {
          this.actionPanel.width = this.actionPanel.defaultOpenWidth
        }
      },
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
      setDraggableBorders() {
        this.$el.querySelectorAll( ".v-navigation-drawer__border").forEach( (border) => {
          border.style.width = this.borderWidth
          border.style.cursor = 'col-resize'
        })
      },
      setDrawerEvents(panel) {
        const el = this.$refs[panel.name].$el
        const drawerBorder = el.querySelector(".v-navigation-drawer__border")
        const vm = this
        const direction = panel.direction

        function resize(e) {
          document.body.style.cursor = "col-resize"
          let f = direction === "right" ? document.body.scrollWidth - e.clientX : e.clientX
          el.style.width = f + "px"
        }

        drawerBorder.addEventListener("mousedown", function() {
            el.style.transition ='initial'
            document.addEventListener("mousemove", resize, false)
        }, false)

        document.addEventListener("mouseup", function() {
          el.style.transition = ''
          if (parseFloat(el.style.width) >  parseFloat(vm[panel.name].minifiedPanelWidth)) {
            vm[panel.name].width = el.style.width
            vm[panel.name].isMini = false
          } else {
            vm[panel.name].width = vm[panel.name].minifiedPanelWidth
            vm[panel.name].isMini = true
          }
          document.body.style.cursor = ""
          document.removeEventListener("mousemove", resize, false)
        }, false)
      }
    },
  }
</script>

<style lang="sass" scoped>
  .story-view-container
    height: calc(100vh - 75px)
    display: flex
    background: #FAFAFA
    border-top-color: var(--v-gray-base)
    border-top-width: 1px
    border-top-style: solid
    padding: 0
    flex-direction: column
    align-items: stretch
  .toolbar-wrapper
    flex-grow: 0
    padding: 0
    margin: 0
    border-bottom-color: var(--v-gray-base)
    border-bottom-style: solid
    border-bottom-width: 1px
  .left-nav-drawer
    border-right-style: solid
    border-right-width: 1px
    border-right-color: var(--v-gray-base)
    margin: 0 !important
  .drawer
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    flex-shrink: 1
  .center-wrapper
    flex-grow: 1
    flex-shrink: 1
  .story-view-panel
    width: 100%
    margin-top: 1rem
  .story-work-panel
    width: 100%
    margin-top: 1rem
  .slide-panel-wrapper
    .flex-grow: 0
  .drawer-wrapper
    flex-grow: 0
    flex-basis: auto
  .workspace-wrapper
    flex-direction: row
    align-items: stretch
  .workspace-content
    padding: 15px !important
</style>
