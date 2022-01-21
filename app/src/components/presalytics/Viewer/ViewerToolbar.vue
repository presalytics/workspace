<template>
  <div class="toolbar-wrapper">
    <v-toolbar
      dense
      color="primary"
      dark
      elevation="0"
    >
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-btn 
        text
        icon
        plain
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        text
        icon
        plain
      >
        <v-icon>mdi-fullscreen</v-icon>
      </v-btn>
      <v-btn 
        text
        icon
        plain
      >
        <v-icon>
          mdi-cards-heart-outline
        </v-icon>
      </v-btn>
      <v-btn 
        text
        icon
        plain
      >
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
    </v-toolbar>
    <v-toolbar
      dense
      elevation="0"
    >
      <v-toolbar-title>
        put some menus here
      </v-toolbar-title>
    </v-toolbar>
  </div>
</template>

<script>
export default {
  name: 'ViewerToolbar',
  props: {
    storyId: {
      type: String,
      required: true
    }
  },
  computed: {
    story() {
      return this.$store.getters['stories/story'](this.storyId)
    },
    title() {
      return this.story.title
    }
  }
}
</script>

<style lang="sass">
  .toolbar-wrapper
    flex-grow: 0
    padding: 0
    margin: 0
    border-bottom-color: rgba(0, 0, 0, 0.12)
    border-bottom-style: solid
    border-bottom-width: 1px
</style>