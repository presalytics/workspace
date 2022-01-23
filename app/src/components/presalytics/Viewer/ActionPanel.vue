<template>
  <v-navigation-drawer
    id="actionPanel"
    ref="actionPanel"
    permanent
    right
    mini-variant
    height="100%"
    mini-variant-width="60px"
    elevation="0"
    :class="{ 'panel-open' : expansionPanelIsOpen }"
  >
    <v-list>
      <v-list-item
        v-for="item in actionList"
        :key="item.component"
      >
        <v-list-item-content>
          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                tile
                plain
                text
                :disabled="item.disabled"
                :class="getButtonClass(item)"
                v-bind="attrs"
                v-on="on"
                @click="handleActionPanelClick(item)"
              >
                <v-icon
                  :color="item.color"
                >
                  {{ item.icon }}
                </v-icon>
              </v-btn>
            </template>
            <span>{{ item.tooltip }}</span>
          </v-tooltip>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
  import { mapActions } from "vuex"
  
  export default {
    name: 'ActionPanel',
    props: {
      storyId: {
        type: String,
        required: true
      }
    },
    data: () => ({}),
    computed: {
      appState() {
        return this.$store.getters['storyviewer/appState'](this.storyId)
      },
      actionList() {
        return this.$store.getters['storyviewer/expansionComponents']
      },
      expansionPanelIsOpen() {
        return this.appState.expansionPanel.isOpen
      }
    },
    methods: {
      ...mapActions('storyviewer', ['updateAppState']),
      handleActionPanelClick(panelItem) {
        this.setExpansionPanelComponent(panelItem.component)
      },
      setExpansionPanelComponent(componentName) {
        let expansionPanel = {...this.appState.expansionPanel}
        if (componentName === expansionPanel.componentName) {
          expansionPanel.isOpen = expansionPanel.isOpen === undefined ? true : !expansionPanel.isOpen
          if (!expansionPanel.isOpen) {
            expansionPanel.componentName = null
          }
        } else {
          expansionPanel.isOpen = true
          expansionPanel.componentName = componentName
        }
        this.updateAppState({
          storyId: this.storyId,
          key: 'expansionPanel',
          value: expansionPanel
        })
      },
      isActive(componentInfo) {
        return componentInfo.component === this.appState.expansionPanel.componentName
      },
      getButtonClass(componentInfo) {
        return this.isActive(componentInfo) ? ['btn-active', 'btn-panel'] : 'btn-panel'
      }
    }
  }
</script>

<style lang="sass">
  .btn-panel
    height: 50px !important
    min-height: 50px !important
    max-height: 50px !important
    width: 50px !important
    min-width: 50px !important
    max-width: 50px !important
    padding: 0 !important

  .btn-active
    background-color: var(--v-gray-lighten3)

  .v-navigation-drawer__border
    width: 3px
    transition-delay: 0.2s
    transition-property: width

  .panel-open .v-navigation-drawer__border
    width: 1px
</style>