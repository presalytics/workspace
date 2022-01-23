<template>
  <v-timeline>

  </v-timeline>

</template>

<script type="ts">
  import Event from '@/components/presalytics/Objects/event'

  export default {
    name: 'EventTimeline',
    props: {
      events: {
        type: Array<Event>,
        required: true
      },
      dense: {
        type: Boolean,
        default: false
      },

    }
  }
</script>