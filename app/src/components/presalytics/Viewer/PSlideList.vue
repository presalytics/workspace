<template>
  <v-list>
    <v-list-item
      v-for="(page, i) in pages"
      :key="i"
    >
      <v-list-item-content>
        <p-slide-list-thumbnail
          :story-id="storyId"
          :page-index="i"
        />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
  import PSlideListThumbnail from '../PSlideListThumbnail.vue'

  export default {
    components: {
      PSlideListThumbnail,
    },
    props: {
      storyId: {
        type: String,
        required: true,
      },
    },
    computed: {
      story () {
        return this.$store.getters['stories/story'](this.storyId)
      },
      outline () {
        return this.$store.state.stories.outlines[this.story.outline]
      },
      pages () {
        return this.outline.document.pages
      },
    },
  }

</script>

<style lang="sass">
  .v-list-item
    padding: 0 !important
</style>
