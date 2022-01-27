<template>
  <v-btn
    text
    @click="showTempAlert"
  >
    {{ latestEventName }}
  </v-btn>
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
      latestEventName () {
        if (this.latestUserEvent) {
          return this.latestUserEvent.eventType
        } else {
          return '--'
        }
      },
      userEvents () {
        var evts = this.$store.getters['apiEvents/eventsDb'].filter((cur) => {
          return cur.resourceId === this.userId || cur.metadata?.relationships?.userId === this.userId
        })
        return evts
      },
      latestUserEvent () {
        if (this.userEvents.length > 0) {
          return this.userEvents.reduce((acc, cur) => {
            var accTs = new Date(acc.time)
            var curTs = new Date(cur.time)
            if (curTs > accTs) {
              acc = cur
            }
            return acc
          }, this.userEvents[0])
        } else {
          return null
        }
      },
    },
    methods: {
      showTempAlert () {
        alert('Replace this text with link once Events page is built')
      },
    },
  }
</script>
