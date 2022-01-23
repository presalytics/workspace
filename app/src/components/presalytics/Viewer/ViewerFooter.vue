<template>
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
      <v-slider
        :max="zoomMax"
        :min="zoomMin"
        thumb-label
        hint="Zoom"
        class="zoom-slider"
      >
        <template v-slot:prepend>
          <v-icon
            class="zoom-icon"
          >
            mdi-magnify-minus
          </v-icon>
        </template>
        <template v-slot:append>
          <v-icon
            class="zoom-icon"
          >
            mdi-magnify-plus
          </v-icon>
        </template>
      </v-slider>
    </v-toolbar>
  </v-footer>
</template>

<script>

  export default {
    name: 'ViewerFooter',
    props: {
      storyId: {
        type: String,
        required: true
      }
    },
    data: () => ({
      zoomMax: 300,
      zoomMin: 10
    }),
    computed: {
      appState() {
        return this.$state.getters['storyviewer/appState'](this.storyId)
      }
    }
  }
</script>

<style lang="sass" scoped>
  .zoom-slider
    max-width: 200px !important
  .zoom-icon
    color: var(--v-gray-base) !important
    margin-top: 3px
</style>