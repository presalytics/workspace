<template>
  <div class="story-list-item">
    <div
      v-if="expanded"
      class="story-list-index-container"
    >
      <span class="story-list-index">
        {{ pageNumber }}
      </span>
      <v-spacer />
    </div>
    <div class="story-list-thumbnail-container">
      <div
        v-if="loading"
        class="skeleton-wrapper"
      >
        <v-skeleton-loader
          type="image"
          class="thumbnail-skeleton-loader"
        />
      </div>
      <v-img
        v-else
        :src="thumbnailUrl"
        aspect-ratio="aspectRatio"
      />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      storyId: {
        type: String,
        required: true,
      },
      pageIndex: {
        type: Number,
        required: true,
      },
    },
    data: function () {
      return {
        aspectRatio: 1.777,
        startPagesAtZero: false,
        resizer: null,
        expanded: false,
      }
    },
    computed: {
      story () {
        return this.$store.getters['stories/story'](this.storyId)
      },
      outline () {
        return JSON.parse(this.story.outline)
      },
      page () {
        return this.outline.pages[this.pageIndex]
      },
      thumbnailUrl () {
        return this.page.thumbnail
      },
      loading () {
        if (this.page.thumbnail) {
          return this.page.thumbnail?.length <= 1
        } else {
          return true
        }
      },
      pageNumber () {
        if (this.startPagesAtZero) {
          return this.pageIndex
        } else {
          return this.pageIndex + 1
        }
      },
    },
    mounted () {
      this.resizer = new ResizeObserver(() => {
        var _timeout
        clearTimeout(_timeout)
        _timeout = setTimeout(this.detectExpanded(), 100)
      })

      this.resizer.observe(this.$el)
    },
    beforeUnmount () {
      if (this.resizer) {
        this.resizer.disconnect()
      }
    },
    methods: {
      detectExpanded () {
        if (this.$el) {
          this.expanded = this.$el.offsetWidth > 100
        } else {
          this.expanded = false
        }
      },
    },
  }
</script>

<style lang="sass" scoped>
  .story-list-item
    display: flex
    height: 100%
    width: 100%
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

</style>
