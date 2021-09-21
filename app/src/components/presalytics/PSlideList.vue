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
  export default {
    components: {
      PSlideListThumbnail: () => import('./PSlideListThumbnail.vue'),
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
        return this.outline.pages
      },
    },
  }

</script>
