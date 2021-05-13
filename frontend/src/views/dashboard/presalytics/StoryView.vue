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
        slide list
      </v-navigation-drawer>
    </v-card>
    <div class="center-item">
      <v-card
        tile
        elevation="5"
      >
        <v-card-title>{{ $route.params.storyId }}</v-card-title>
        <v-card-text>This will be the Story View Page for Story:</v-card-text>
      </v-card>
      <v-card
        tile
        elevation="5"
        class="story-view-panel"
      >
        <v-card-title>Story View Panel</v-card-title>
        <v-card-text>Place the rendered story view in here</v-card-text>
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
          <v-list-item-title>Slides</v-list-item-title>
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

  export default {
    name: 'StoryView',
    data: () => ({
      minifiedPanelWidth: '60px',
      slidesPanelIsMini: true,
      slidePanel: true,
      slidesPanelOpenWidth: '200px',
      actionPanelIsMini: true,
      actionPanel: true,
      actionPanelOpenWidth: '350px',
    }),
    computed: {
      isBuilder () {
        return true
      },
    },
    methods: {
      handleSlidePanelToggle (e) {
        this.slidesPanelIsMini = !this.slidesPanelIsMini
      },
      handleActionPanelToggle (e) {
        this.actionPanelIsMini = !this.actionPanelIsMini
      },

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
    padding-bottom: 43.75%
    margin-top: 1rem
  .story-work-panel
    width: 100%
    margin-top: 1rem
</style>
