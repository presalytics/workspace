<template>
  <action-module-wrapper
    title="Story Timeline"
    subtitle="Recent Events"
  >
    <event-timeline
      :events="events"
    />
  </action-module-wrapper>
</template>

<script lang="ts">
  import Vue, { VueConstructor } from 'vue'
  import EventTimeline from '../../Modules/EventTimeline.vue'
  import ViewerMixin from "../types/viewer-mixin"
  import ActionModuleWrapper from './ActionModuleWrapper.vue'
  import Event from '@/objects/event'
  

  export default (Vue as VueConstructor & InstanceType<typeof ViewerMixin>).extend({
    name: 'StoryTimeline',
    components: {
      ActionModuleWrapper,
      EventTimeline
    },
    mixins: [ViewerMixin],
    computed: {
      events(): Array<Event> {
        return this.$store.getters['events/eventdb']
      }
    }
  })
</script>