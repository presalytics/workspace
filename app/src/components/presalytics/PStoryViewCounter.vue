<template>
  <div>
    {{ viewCount }}
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
    },
    created () {
      var storyId = this.$props.story.item.id
      this.$store.dispatch('apiEvents/getStoryEvents', storyId)
    },
  }
</script>
