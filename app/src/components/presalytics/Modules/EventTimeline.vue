<template>
  <v-timeline
    :dense="dense"
  >
    <v-timeline-item
      v-for="evt in displayedEvents"
      :key="evt.id"
      :icon="evt.eventType ? evt.eventType.icon : ''"
      :color="evt.eventType ? evt.eventType.color : ''"
    >
      <template v-if="compact">
        <v-row>
          <v-col class="text-left">
            {{ evt.eventType ? evt.eventType.shortName : '' }} 
          </v-col>
          <v-col class="text-right text-caption font-weight-thin timeline-date">
            {{ evt.getFriendlyTime() }}
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <v-card
          elevation="2"
        >
          <v-card-title>
            {{ evt.eventType ? evt.eventType.shortName : '' }}
          </v-card-title>
          <v-card-subtitle>
            {{ evt.getFriendlyTime() }}
          </v-card-subtitle>
          <v-card-text>
            {{ evt.getDescription() }}
          </v-card-text>
        </v-card>
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<script lang="ts">
  import Vue, { PropType }from 'vue' 
  import Event from '@/objects/event'

  export default Vue.extend({
    name: 'EventTimeline',
    props: {
      events: {
        type: Array as PropType<Array<Event>>, 
        required: true
      },
      dense: {
        type: Boolean,
        default: false
      },
      compact: {
        type: Boolean,
        default: false
      },
      length: {
        type: Number,
        default: 5
      },
    },
    computed: {
      displayedEvents() : Array<Event> {
        return this.events.filter( (evt) => evt.hasEventType()).slice(0, this.length)
      }
    },
  })
</script>

<style lang="sass">
  .v-timeline-item__divider
    min-width: 48px !important
  .v-timeline-item
    justify-content: center
    align-items: center
  .timeline-date
    color: var(--v-gray-base)
</style>