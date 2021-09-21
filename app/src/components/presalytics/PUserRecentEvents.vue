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
        var vm = this
        var evts = vm.$store.getters['apiEvents/eventsDb'].filter((cur) => {
          return cur.resourceId === vm.userId || cur.metadata?.relationships?.userId === vm.userId
        })
        return evts
      },
      latestUserEvent () {
        if (this.userEvents.length > 0) {
          return this.userEvents.reduce((acc, cur) => {
            var accTs = new Date(acc.timeStampUTC)
            var curTs = new Date(cur.timeStampUTC)
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
