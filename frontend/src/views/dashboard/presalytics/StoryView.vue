<template>
  <v-container
    id="story-view-main"
    fluid
    class="story-view-container"
  >
    <div
      id="slides-container"
      class="adjusto-container"
    >
      <v-card
        tile
        elevation="5"
        class="drawer grid-item"
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
              @click="handleSlidePanelToggle"
            >
              <v-icon>mdi-slide</v-icon>
            </v-btn>
            <v-list-item-title>Slides</v-list-item-title>
            <v-btn
              icon
              @click.stop="handleSlidePanelToggle"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-list-item>
          <v-divider />
          slide list
        </v-navigation-drawer>
      </v-card>
    </div>
    <div
      id="toolbar-container"
      class="adjusto-container"
    >
      <v-card
        tile
        elevation="5"
        class="grid-item ma-0"
      >
        <v-card-title>{{ $route.params.storyId }}</v-card-title>
        <v-card-text>This will be the Story View Page for Story:</v-card-text>
      </v-card>
    </div>
    <div
      id="action-panel"
      class="adjusto-container"
    >
      <v-card
        tile
        elevation="5"
        class="grid-item ma-0"
      >
        <v-card-title>Actions Panel</v-card-title>
        <v-card-text>show the acccordion below</v-card-text>
      </v-card>
    </div>
    <div
      id="story-viewer"
      class="adjusto-container"
    >
      <v-card
        tile
        elevation="5"
        class="grid-item ma-0 fit-height"
      >
        <v-card-title>Story View Panel</v-card-title>
        <v-card-text>Place the rendered story view in here</v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
  import { mapMutations } from 'vuex'
  import { debounce } from 'lodash'

  var getRemRatio = () => {
    return Number.parseInt(getComputedStyle(
      // for the root <html> element
      document.documentElement,
    ).fontSize.replace('px', '').replace('rem', ''))
  }

  var getPixels = (value) => {
    if (typeof value === 'string') {
      if (!value.endsWith('px')) {
        value += 'px'
      }
    } else if (typeof value === 'number') {
      value += 'px'
    }
    return value
  }

  export default {
    name: 'StoryView',
    data: () => ({
      rightPanel: true,
      slideNavPanel: true,
      canvas: null,
      slidesContainer: null,
      toolbarContainer: null,
      actionPanel: null,
      storyViewer: null,
      gridWidth: null,
      minifiedPanelWidth: '60px',
      slidesPanelIsMini: true,
      slidePanel: true,
      slidesPanelOpenWidth: '200px',
    }),
    computed: {
      isBuilder () {
        return true
      },
      panelStates () {
        return this.$store.getters['stories/viewPage']
      },
      slidesPanelActive () {
        return this.panelStates.slidePanel
      },
      actionPanelActive () {
        return this.panelStates.actionPanel
      },
    },
    mounted () {
      this.init()
      this.layout()
      this.$nextTick(function () {
        window.addEventListener('resize', this.onResize)
      })
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.onResize)
    },
    methods: {
      ...mapMutations('stories', {
        toggleRightPanel: 'TOGGLE_RIGHT_PANEL',
        toggleSlideNavPanel: 'TOGGLE_SLIDENAV_PANEL',
      }),
      layout () {
        this.setGridWidth()
        // this.positionSlidesPanel()
        this.positionToolbar()
        this.positionActionPanel()
        this.positionStoryViewer()
      },
      init () {
        this.canvas = document.querySelector('#story-view-main')
        this.slidesContainer = document.querySelector('#slides-container')
        this.toolbarContainer = document.querySelector('#toolbar-container')
        this.actionPanel = document.querySelector('#action-panel')
        this.storyViewer = document.querySelector('#story-viewer')
      },
      setGridWidth () {
        this.gridWidth = this.canvas.offsetWidth / 12
      },
      onResize () {
        var debouncedLayout = debounce(() => this.layout(), 250)
        debouncedLayout()
      },
      positionSlidesPanel () {
        this.slidesContainer.style.top = getPixels(0)
        this.slidesContainer.style.left = getPixels(0)
        this.slidesContainer.style.width = getPixels(this.gridWidth * 2)
        this.setSlidesPanelHeight()
      },
      setSlidesPanelHeight () {
        if (this.slidesPanel) {
          this.slidesContainer.addClass('active')
        }
      },
      positionToolbar () {
        this.toolbarContainer.style.top = getPixels(0)
        this.toolbarContainer.style.left = getPixels(this.gridWidth * 2)
        this.toolbarContainer.style.width = getPixels(this.gridWidth * 7)
      },
      positionActionPanel () {
        this.actionPanel.style.top = getPixels(0)
        this.actionPanel.style.left = getPixels(this.gridWidth * 9)
        this.actionPanel.style.width = getPixels(this.gridWidth * 3)
        if (this.actionPanelActive) {
          this.actionPanel.addClass('active')
        }
      },
      positionStoryViewer () {
        this.storyViewer.top = '4rem'
        if (this.slidesPanelActive) {
          this.storyViewer.style.left = getPixels(this.gridWidth * 2)
          if (this.actionsPanelActive) {
            this.storyViewer.style.width = getPixels(this.gridWidth * 7)
          } else {
            this.storyViewer.style.width = getPixels(this.gridWidth * 10)
          }
        } else {
          this.storyViewer.style.left = getPixels(0)
          if (this.actionsPanelActive) {
            this.storyViewer.style.width = getPixels(this.gridWidth * 9)
          } else {
            this.storyViewer.style.width = getPixels(this.gridWidth * 12)
          }
        }
        var containerHeight = document.documentElement.clientHeight - 6 * getRemRatio()
        this.storyViewer.style.height = getPixels(Math.min(this.storyViewer.offsetWidth * 9 / 16, containerHeight - 6 * getRemRatio()))
      },
      handleSlidePanelToggle (e) {
        this.slidesPanelIsMini = !this.slidesPanelIsMini
      },

    },
  }
</script>

<style lang="sass" scoped>
  .story-view-container
    min-height: calc(100vh - 75px)
    position: relative
  .adjusto-container
    position: absolute
    padding: 1rem
  .grid-item
    width: 100%
    max-height: 100%
    margin: 0
  #slides-container.active
    height: 100% !important
  #slides-container
    height: 6rem
  #action-panel
    height: 6rem
  #action-panel.active
    height: 100% !important
  #toolbar-container
    height: 6rem
  #story-viewer
    top: 6rem
  .fit-height
    height: 100%
  .drawer
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
</style>
