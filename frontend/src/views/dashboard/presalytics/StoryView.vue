<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-toolbar>
          <v-toolbar-title>Story View</v-toolbar-title>
          <v-spacer />
          <v-btn-toggle
            tile
            multiple
            borderless
            color="warning"
          >
            <v-btn
              text
            >
              <v-icon left>
                mdi-page-layout-sidebar-left
              </v-icon>
              Slide Navigator
            </v-btn>
            <v-btn
              text
            >
              <v-icon left>
                mdi-page-layout-sidebar-right
              </v-icon>
              Actions Panel
            </v-btn>
          </v-btn-toggle>
          <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="2"
      >
        <v-card
          tile
          elevation="5"
          class="ma-0"
        >
          <v-card-title>Slides</v-card-title>
          <v-card-text>This will be the slide thumbnail naigator</v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        :class="viewerColClass"
      >
        <v-card
          tile
          elevation="5"
          class="ma-0"
        >
          <v-card-title>{{ $route.params.storyId }}</v-card-title>
          <v-card-text>This will be the Story View Page for Story:</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card
          tile
          elevation="5"
          class="ma-0"
        >
          <v-card-title>Actions Panel</v-card-title>
          <v-card-text>show the acccordion below</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapMutations } from 'vuex'

  export default {
    name: 'StoryView',
    data: () => ({
      rightPanel: true,
      slideNavPanel: true,
    }),
    computed: {
      isBuilder () {
        return true
      },
      viewerColClass () {
        return 'col-md-7'
      },
    },
    methods: {
      ...mapMutations('stories', {
        toggleRightPanel: 'TOGGLE_RIGHT_PANEL',
        toggleSlideNavPanel: 'TOGGLE_SLIDENAV_PANEL',
      }),
    },
  }
</script>
