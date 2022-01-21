<template>
  <v-navigation-drawer
    id="actionPanel"
    ref="actionPanel"
    permanent
    right
    mini-variant
    height="100%"
    mini-variant-width="60px"
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
                icon
                plain
                text
                large
                :disabled="item.disabled"
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
    }
  }
</script>