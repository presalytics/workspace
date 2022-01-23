<template>
  <div
    id="expansion-panel" 
    class="d-flex flex-row mx-0 my-0 py-0 px-0 stretch"
  >
    <div
      id="expansion-panel-border"
      :class="{ 'border-open' : isOpen }"
    />
    <transition 
      name="expand"
      mode="out-in"
      @afterLeave="expandAfterLeave"
      @afterEnter="expandAfterEnter"
      @beforeLeave="expandBeforeLeave"
      @beforeEnter="expandBeforeEnter"
      @leave="expandLeave"
    >
      <v-card
        v-show="isOpen"
        id="expansion-panel-card"
        ref="expansionPanelCard"
        tile
        elevation="0"
        :class="classList"
      >
        <v-toolbar
          elevation="0"
        >
          <v-toolbar-title>{{ title }}</v-toolbar-title>
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
            @click="closeExpansionPanel"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>
    </transition>
  </div>
</template>

<script>
  import { mapActions } from "vuex"

  export default {
    name: 'ExpansionPanel',
    props: {
      storyId: {
        type: String,
        required: true,
      }
    },
    data: () => ({
      isExpanding: false
    }),
    computed: {
      appState() {
        return this.$store.getters['storyviewer/appState'](this.storyId)
      },
      isOpen() {
        return this.appState.expansionPanel.isOpen || false
      },
      componentName() {
        return this.appState.expansionPanel.componentName || null
      },
      componentInfo() {
        if (this.componentName) {
          return this.$store.getters['storyviewer/expansionComponents'].filter( (cur) => cur.component === this.componentName)[0]
        } else {
          return null
        }
      },
      title() {
        if (this.componentInfo) {
          return this.componentInfo.title
        } else {
          return ''
        }
      },
      classList() {
        if (this.isExpanding) {
          return []
        } else {
          if (this.isOpen) {
            return ['expand-open']
          } else {
            return ['expand-closed']
          }
        }
      },
    },
    created() {
      this.updateAppState({
        storyId: this.storyId,
        key: 'expansionPanel',
        value: {
          isOpen: false
        }
      })
    },
    mounted() {
      this.setDrawerEvents()
    },
    methods: {
      ...mapActions('storyviewer', ['updateAppState']),
      setExpansionPanel(isOpenValue) {
        let panel = {...this.appState.expansionPanel}
        panel.isOpen = isOpenValue
        this.updateAppState({
          storyId: this.storyId,
          key: 'expansionPanel',
          value: panel
        })
      },
      closeExpansionPanel() {
        this.setExpansionPanel(false)
      },
      expandAfterLeave() {
        this.isExpanding = false
        this.$refs.expansionPanelCard.$el.style.width = null
      },
      expandBeforeLeave() {
        this.isExpanding = true
      },
      expandAfterEnter() {
        this.isExpanding = false
      },
      expandBeforeEnter() {
        this.isExpanding = true
        this.$refs.expansionPanelCard.$el.style.width = null
      },
      expandLeave() {
        this.isExpanding = true
        this.$refs.expansionPanelCard.$el.style.width = null
      },
      setDrawerEvents() {
        const el = this.$refs.expansionPanelCard.$el
        const drawerBorder = this.$el.querySelector("#expansion-panel-border")
        const vm = this

        function resize(e) {
          document.body.style.cursor = "col-resize"
          let f = document.body.scrollWidth - e.clientX - 60
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
          } else {
            vm.width = vm.minifiedPanelWidth
          }
          document.body.style.cursor = ""
          document.removeEventListener("mousemove", resize, false)
        }, false)
      },
    },
  }
</script>

<style lang="sass">
  #expansion-panel-border
    background-color: rgba(0, 0, 0, 0.12) !important
    margin: 0
    padding: 0
    width: 0
    cursor: col-resize
  #expansion-panel-card
    height: calc(100vh - 65px - 75px - 96px) !important
    margin: 0
  .expand-enter-active, .expand-leave-active
    transition-property: width
    transition-duration: 0.2s
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)
  .expand-enter, .expand-leave-to, .expand-closed
    width: 0
  .expand-leave, .expand-enter-to, .expand-open
    width: 350px
  #expansion-panel-border.border-open
    width: 3px
</style>