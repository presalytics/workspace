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
      >
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-btn 
          text
          icon
          plain
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-spacer />
        <v-btn
          text
          icon
          plain
        >
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>
        <v-btn 
          text
          icon
          plain
        >
          <v-icon>
            mdi-cards-heart-outline
          </v-icon>
        </v-btn>
        <v-btn 
          text
          icon
          plain
        >
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
      </v-toolbar>
      <v-toolbar
        dense
        elevation="0"
      >
        <v-toolbar-title>
          put some menus here
        </v-toolbar-title>
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

        <div
          id="expansion-panel" 
          class="d-flex flex-row mx-0 my-0 py-0 px-0 stretch"
        >
          <div
            id="expansion-panel-border"
          />

          <v-card
            id="expansion-panel-card"
            ref="expansionPanelCard"
            tile
            :width="expansionPanel.width"
            elevation="0"
            class="my-0"
          >
            <v-toolbar
              elevation="0"
            >
              <v-toolbar-title>Expansion Panel</v-toolbar-title>
              <v-spacer />
              <v-btn
                plain
                text
                icon
              >
                <v-icon>mdi-dock-window</v-icon>
              </v-btn>              
              <v-btn
                plain
                text
                icon
                @click="toggleExpansionPanel"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
          </v-card>
        </div>

        <v-navigation-drawer
          id="actionPanel"
          ref="actionPanel"
          v-model="actionPanel.open"
          permanent
          right
          height="100%"
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
  import PSlideList from '@/components/presalytics/PSlideList.vue'
  import { v4 as uuidv4 } from 'uuid'
  
  export default {
    name: 'StoryViewApp',
    components: {
      StoryViewer,
      PSlideList,
    },
    props: {
      storyId: {
        type: String,
        required: true
      }
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
        this.toggleExpansionPanel()
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
      },
      toggleExpansionPanel() {
        let el = this.$refs.expansionPanelCard.$el
        if (this.expansionPanel.open) {
          el.style.width = this.expansionPanel.defaultClosedWidth
        } else {
          el.style.width = this.expansionPanel.defaultOpenWidth
        }
        this.expansionPanel.open = !this.expansionPanel.open
      }
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
  .toolbar-wrapper
    flex-grow: 0
    padding: 0
    margin: 0
    border-bottom-color: rgba(0, 0, 0, 0.12)
    border-bottom-style: solid
    border-bottom-width: 1px
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
  #expansion-panel-border
    background-color: rgba(0, 0, 0, 0.12) !important
    margin: 0
    padding: 0
    width: 3px
    cursor: col-resize
  #expansion-panel-card
    height: calc(100vh - 65px - 75px - 96px) !important


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
