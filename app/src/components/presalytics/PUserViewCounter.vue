<template>
  <div>
    {{ viewCount }}
  </div>
</template>

<script>
  export default {
    props: {
      userId: {
        type: String,
        default: '',
      },
    },
    computed: {
      viewCount () {
        return this.$store.getters['apiEvents/eventsDb'].filter((cur) => {
          if (cur.metadata?.relationships?.userId) {
            return cur.eventType === 'story.session_created' && cur.metadata.relationships.userId === this.userId
          } else {
            return false
          }
        }).length
      },
    },
  }
</script>
