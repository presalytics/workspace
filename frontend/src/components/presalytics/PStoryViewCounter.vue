<template>
  <div>
    <template v-if="loading">
      <v-skeleton-loader
        type="text"
        :loading="loading"
      />
    </template>
    <template v-else>
      {{ viewCount }}
    </template>
  </div>
</template>

<script>
  export default {
    props: {
      story: {
        type: Object,
        default: () => {},
      },
    },
    computed: {
      viewCount () {
        var storyId = this.$props.story.item.id
        return this.$store.getters['apiEvents/eventsDb'].filter((cur) => {
          return cur.eventType === 'story.session_created' && cur.resourceId === storyId
        }).length
      },
      loading () {
        var vm = this
        var storyId = vm.$props.story.item.id
        return vm.$store.getters['apiEvents/getStoryEvents'](storyId).length === 0
      },
    },
    created () {
      var storyId = this.$props.story.item.id
      this.$store.dispatch('apiEvents/getStoryEvents', storyId)
    },
  }
</script>
