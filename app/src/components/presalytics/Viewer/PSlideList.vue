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
  import { mapActions } from 'vuex'
  import PSlideListThumbnail from './PSlideListThumbnail.vue'

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
      appState() {
        return this.$store.getters['storyviewer/appState'](this.storyId)
      },
      activePageId() {
        return this.appState.activePageId
      },
      activePageIndex() {
        return this.pages.findIndex( (cur) => cur.id == this.activePageId)
      }
    },
    methods: {
      ...mapActions('storyviewer', ['updateAppState']),
      setActivePage(pageId) {
        this.updateAppState({
          storyId: this.storyId,
          key: 'activePageId',
          value: pageId
        })
      }
    }
  }

</script>

<style lang="sass">
  .v-list-item
    padding: 0 !important
</style>
