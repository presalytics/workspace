<template>
  <v-navigation-drawer
    id="slidePanelDrawer"
    ref="slidePanelDrawer"
    v-model="isOpen"
    permanent
    :mini-variant-width="minifiedPanelWidth"
    :mini-variant.sync="isMini"
    :width="width"
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
      :story-id="storyId"
    />
  </v-navigation-drawer>
</template>

<script>
import { mapActions } from 'vuex'
import { debounce } from 'lodash-es'
import PSlideList from './PSlideList.vue'

export default {
  name: 'SlidePanel',
  components: {
    PSlideList,
  },
  props: {
    storyId: {
      type: String, 
      required: true
    }
  },
  data: () => ({
    isOpen: false,
    isMini: true,
    defaultOpenWidth: '200px',
    minifiedPanelWidth: '60px',
    borderWidth: '3px',
    direction: 'left',
    width: '60px',
  }),
  computed: {
    appState() {
      return this.$store.getters['storyviewer/appState'](this.storyId)
    },
  },
  watch: {
    width () {
      this.updateState()
    },
    isMini () {
      this.updateState()
    },
    isOpen () {
      this.updateState()
    }
  },
  created() {
    this.initState()
  },
  mounted() {
    this.setDraggableBorders()
    this.setDrawerEvents()
  },
  methods: {
    ...mapActions('storyviewer', ['updateAppState']),
    getStateValues() {
      return {
        isOpen: this.isOpen,
        isMini: this.isMini,
        width: this.width
      }
    },
    updateState() {
      let fn = debounce( () => {
        let payload = {
          storyId: this.storyId,
          key: 'slidePanel',
          value: this.getStateValues()
        }
        this.updateAppState(payload)
      }, 750)
      fn()
    },
    initState() {
      if (!this.appState?.slidePanel) {
        this.updateState()
      }
    },
    handleSlidePanelToggle () {
      this.isMini = !this.isMini
      if (!this.isMini) {
        this.width = this.defaultOpenWidth
      }
    },
    setDraggableBorders() {
      let border = this.$el.querySelector( ".v-navigation-drawer__border")
      border.style.width = this.borderWidth
      border.style.cursor = 'col-resize'
    },
    setDrawerEvents() {
      const el = this.$refs.slidePanelDrawer.$el
      const drawerBorder = el.querySelector(".v-navigation-drawer__border")
      const vm = this
      const direction = this.direction

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
        if (parseFloat(el.style.width) >  parseFloat(vm.minifiedPanelWidth)) {
          vm.width = el.style.width
          vm.isMini = false
        } else {
          vm.width = vm.minifiedPanelWidth
          vm.isMini = true
        }
        document.body.style.cursor = ""
        document.removeEventListener("mousemove", resize, false)
      }, false)
    },
  }
}
</script>