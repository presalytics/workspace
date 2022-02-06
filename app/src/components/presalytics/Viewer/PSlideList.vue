<template>
  <v-list
    class="slide-list"
    :class="{ 'slide-list-expanded' : expanded }"
  >
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

<script lang="ts">
  import Vue, { VueConstructor } from 'vue'
  import ViewerMixin from './mixins/viewer-mixin'
  import PSlideListThumbnail from './PSlideListThumbnail.vue'
  import StoryPage from '@/objects/story/story-page'

  export default (Vue as VueConstructor<Vue & InstanceType<typeof ViewerMixin>>).extend({
    components: {
      PSlideListThumbnail,
    },
    mixins: [ViewerMixin],
    props: {
      storyId: {
        type: String,
        required: true,
      },
    },
    computed: {
      pages(): Array<StoryPage> {
        return this.outline.document.pages
      },
      expanded(): boolean {
        return this.appState.slidePanel.isOpen
      }
    }
  })

</script>

<style lang="sass">
  .v-list-item
    padding: 0px !important
  .slide-list
    flex-grow: 1
    overflow-y: auto
    overflow-y: overlay
    flex-shrink: 1
    padding-left: 0px
    overflow-x: hidden
  .slide-list-expanded
    overflow-y: auto !important
    padding-left: 12px !important
  .slide-list::-webkit-scrollbar-track
    background-color: transparent
  .slide-list::-webkit-scrollbar
    width: 12px
  .slide-list::-webkit-scrollbar-thumb
    border-radius: 10px
    background-color: transparent
    background-clip: content-box
    border: 1px solid transparent
  .slide-list:hover::-webkit-scrollbar-thumb
    background-color: var(--v-gray-lighten2)
</style>
