<template>
  <div 
    class="story-list-item"
    @click="setPage"
  >
    <v-hover
      v-slot="{ hover }"
    >
      <div class="story-list-thumbnail-container">
        <div class="skeleton-wrapper">
          <ooxml-widget
            :widget="page.widgets[0]"
          />
        </div>
        <v-fade-transition>
          <v-overlay
            v-if="hover"
            absolute
            color="gray"
          >
            <span 
              :class="overlayTextClass"
            >
              {{ pageNumber }}
            </span>
          </v-overlay>
        </v-fade-transition>
      </div>
    </v-hover>
  </div>
</template>

<script lang="ts">
  import Vue, { VueConstructor } from 'vue'
  import OoxmlWidget from './Widgets/OoxmlWidget.vue'
  import ViewerMixin from './mixins/viewer-mixin'
  import StoryPage from '@/objects/story/story-page'

  export default (Vue as VueConstructor<Vue & InstanceType<typeof ViewerMixin>>).extend({
    components: {
      OoxmlWidget
    },
    mixins: [ViewerMixin],
    props: {
      storyId: {
        type: String,
        required: true,
      },
      pageIndex: {
        type: Number,
        required: true
      }
    },
    data: function () {
      return {
        aspectRatio: 1.777,
      }
    },
    computed: {
      pageNumber(): number {
        return this.pageIndex + 1
      },
      expanded(): boolean {
        return this.appState.slidePanel.isOpen
      },
      page(): StoryPage {
        return this.outline.document.pages[this.pageIndex]
      },
      overlayTextClass(): string {
        let spanClass = 'text-overlay-closed'
        if (this.expanded) {
          spanClass = 'text-overlay-open'
        }
        return spanClass
      }
    },
    methods: {
      setPage() {
        this.setActivePageIndex(this.pageNumber)
      }
    },
  })
</script>

<style lang="sass" scoped>
  .story-list-item
    display: flex
    height: 100%
    width: 100%
    padding: 5px
    border-radius: 5px
  .thumbmail-skeleton-loader
    padding-bottom: 56.25%
    width: 100% !important
  .story-list-thumbnail-container
    width: 100%
  .v-skeleton-loader__image
    height: 100% !important
    width: 100%
    top: 0
    left: 0
    position: absolute
  .skeleton-wrapper
    height: 0
    overflow: hidden
    padding-bottom: 56.25%
    position: relative
  .story-list-index-container
    display: flex
    flex-direction: column
  .story-list-index
    padding-right: 0.5rem
    font-wieght: 900
    font-size: .75rem
  .story-list-item:hover
    background-color: #eee
  .text-overlay-open
    font-size: 3rem
    color: #fff
  .text-overlay-closed
    font-size: 1.5rem
    color: #fff

</style>
