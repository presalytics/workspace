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

<script lang="ts">
  import Vue, { VueConstructor } from 'vue'
  import ExpansionComponent from './types/expansion-component'
  import ViewerMixin from './mixins/viewer-mixin'

  export default (Vue as VueConstructor<Vue & InstanceType<typeof ViewerMixin>>).extend({
    name: 'ExpansionPanel',
    mixins: [ViewerMixin],
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
      isOpen(): boolean {
        return this.appState.expansionPanel.isOpen
      },
      componentName(): string {
        return this.appState.expansionPanel.componentName
      },
      componentInfo(): ExpansionComponent | null {
        if (this.componentName) {
          return this.$store.getters['storyviewer/expansionComponents']
            .find( (cur: ExpansionComponent) => cur.component === this.componentName)
        } else {
          return null
        }
      },
      title(): string {
        if (this.componentInfo) {
          return this.componentInfo.title
        } else {
          return ''
        }
      },
      classList(): Array<string> {
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
      setExpansionPanel(isOpenValue: boolean): void {
        let panel = {...this.appState.expansionPanel}
        panel.isOpen = isOpenValue
        this.updateAppState({
          storyId: this.storyId,
          key: 'expansionPanel',
          value: panel
        })
      },
      closeExpansionPanel(): void {
        this.setExpansionPanel(false)
      },
      expandAfterLeave(): void {
        this.isExpanding = false
        this.nullifyExpansionPanelWidth()
      },
      expandBeforeLeave(): void {
        this.isExpanding = true
      },
      expandAfterEnter(): void {
        this.isExpanding = false
      },
      expandBeforeEnter(): void {
        this.isExpanding = true
        this.nullifyExpansionPanelWidth()
      },
      nullifyExpansionPanelWidth(): void {
        const el = this.getExpansionPanelElement()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        el.style.width = null
      },
      expandLeave(): void {
        this.isExpanding = true
        this.nullifyExpansionPanelWidth()
      },
      getExpansionPanelElement(): HTMLElement {
        if (!this.$refs.expansionPanelCard) {
          throw new Error('Element $ref "expansionPanelCard" does not exist')
        }
        let panel = this.$refs.expansionPanelCard as Vue
        return panel.$el as HTMLElement
      },
      setDrawerEvents(): void {
        const el = this.getExpansionPanelElement()
        const drawerBorder = this.$el.querySelector("#expansion-panel-border") as HTMLElement

        function resize(e: MouseEvent) {
          document.body.style.cursor = "col-resize"
          let f = document.body.scrollWidth - e.clientX - 60
          el.style.width = f + "px"
        }
        
        drawerBorder.addEventListener("mousedown", function() {
            el.style.transition ='initial'
            document.addEventListener("mousemove", resize, false)
        }, false)
      
        document.addEventListener("mouseup", () => {
          el.style.transition = ''
          document.body.style.cursor = ""
          document.removeEventListener("mousemove", resize, false)
        }, false)
      
      },
    },
  })
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