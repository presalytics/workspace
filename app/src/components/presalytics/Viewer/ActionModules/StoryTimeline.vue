<template>
  <action-module-wrapper
    title="Story Timeline"
    subtitle="Recent Events"
    @toggle-expansion-panel="toggleExpansionPanel"
  >
    <event-timeline
      :dense="compact"
      :compact="compact"
      :events="events"
      :length="length"
    />
  </action-module-wrapper>
</template>

<script lang="ts">
  import Vue, { VueConstructor } from 'vue'
  import EventTimeline from '../../Modules/EventTimeline.vue'
  import ViewerMixin from "../mixins/viewer-mixin"
  import ActionModuleWrapper from './ActionModuleWrapper.vue'
  import Event from '@/objects/event'
  

  export default (Vue as VueConstructor<Vue & InstanceType<typeof ViewerMixin>>).extend({
    name: 'StoryTimeline',
    components: {
      ActionModuleWrapper,
      EventTimeline
    },
    mixins: [ViewerMixin],
    props: {
      compact: {
        type: Boolean,
        required: true,
      },
    },
    data: () => ({
      length: 10
    }),
    computed: {
      events(): Array<Event> {
        return this.$store.getters['apiEvents/getStoryEvents'](this.storyId)
      }
    }
  })
</script>