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
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        default: () => {},
      },
    },
    computed: {
      viewCount () {
        var storyId = this.$props.story.item.id
        return this.$store.getters['apiEvents/eventsDb'].filter((cur) => {
          return cur.type === 'story.view_session_started' && cur.data.resourceId === storyId
        }).length
      },
    },
    created () {
      var storyId = this.$props.story.item.id
      this.$store.dispatch('apiEvents/getStoryEvents', storyId)
    },
  }
</script>
