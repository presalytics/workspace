<template>
  <v-navigation-drawer
    id="slidePanelDrawer"
    ref="slidePanelDrawer"
    permanent
    :mini-variant-width="minifiedPanelWidth"
    :mini-variant="!isOpen"
    :width="width"
    class="left-nav-drawer"
  >
    <v-list-item
      class="px-2 slides-controller"
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
      :story-id="storyId"
    />
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import ViewerMixin from './mixins/viewer-mixin'
import { mapActions } from 'vuex'
import PSlideList from './PSlideList.vue'
import SlidePanelState from '@/objects/viewer/slide-panel-state'

export default (Vue as VueConstructor<Vue & InstanceType<typeof ViewerMixin>>).extend({
  name: 'SlidePanel',
  components: {
    PSlideList,
  },
  mixins: [ViewerMixin],
  props: {
    storyId: {
      type: String, 
      required: true
    }
  },
  data: () => ({
    defaultOpenWidth: '200px',
    minifiedPanelWidth: '60px',
    borderWidth: '3px',
    direction: 'left',
    width: '60px',
  }),
  computed: {
    isOpen: {
      get: function(): boolean {
        return this.panelState.isOpen
      },
      set: function(newValue: boolean): void {
        this.setSlidePanel(newValue)
      }
    },
    panelState(): SlidePanelState {
      return this.appState.slidePanel
    },
  },
  mounted() {
    this.setDraggableBorders()
    this.setDrawerEvents()
  },
  methods: {
    ...mapActions('storyviewer', ['updateAppState']),
    handleSlidePanelToggle () {
      const newIsOpen = !this.isOpen
      this.setSlidePanel(newIsOpen)
    },
    setSlidePanel(newOpenValue: boolean) {
      if (newOpenValue) {
        this.width = this.defaultOpenWidth
      } else {
        this.width = this.minifiedPanelWidth
      }
      if (this.isOpen !== newOpenValue) {
        const panelState = {...this.panelState}
        panelState.isOpen = newOpenValue
        this.updateAppState({
          storyId: this.storyId,
          key: 'slidePanel',
          value: panelState
        })
      }

    },
    setDraggableBorders(): void {
      let border = this.$el.querySelector( ".v-navigation-drawer__border") as HTMLElement
      border.style.width = this.borderWidth
      border.style.cursor = 'col-resize'
    },
    getPanelDrawer(): HTMLElement {
    if (!this.$refs.slidePanelDrawer) {
        throw new Error('Element $ref "slidePanelDrawer" does not exist')
      }
      let panel = this.$refs.slidePanelDrawer as Vue
      return panel.$el as HTMLElement
    },
    setDrawerEvents(): void {
      const el = this.getPanelDrawer()
      const drawerBorder = el.querySelector(".v-navigation-drawer__border") as HTMLElement

      function resize(e: MouseEvent) {
        document.body.style.cursor = "col-resize"
        let f = e.clientX
        el.style.width = f + "px"
      }

      drawerBorder.addEventListener("mousedown", () => {
          el.style.transition ='initial'
          document.addEventListener("mousemove", resize, false)
      }, false)

      document.addEventListener("mouseup", () => {
        el.style.transition = ''
        if (parseFloat(el.style.width) >  parseFloat(this.minifiedPanelWidth)) {
          this.width = el.style.width
        } else {
          this.width = this.minifiedPanelWidth
        }
        document.body.style.cursor = ""
        document.removeEventListener("mousemove", resize, false)
      }, false)
    },
  }
})
</script>

<style lang="sass">
  .left-nav-drawer
    overflow-y: hidden
  .v-navigation-drawer__content
    overflow-y: hidden !important
    display: flex
    flex-direction: column
    align-items: stretch
    justify-content: center
  .slides-controller
    flex-grow: 0 !important
    flex-shrink: 1 !important
    flex-basis: auto !important
</style>