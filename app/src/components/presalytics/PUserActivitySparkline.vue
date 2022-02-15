<template>
  <event-sparkline 
    :query="getEventQuery()"
  />
</template>

<script lang="ts">
  import Vue, { VueConstructor } from 'vue'
  import DateMixin from '@/mixins/date-mixin'
  import EventSparkline from '@/components/presalytics/Modules/EventSparkline.vue'
  import EventQuery from '@/objects/api-event/event-query'
  
  export default (Vue as VueConstructor<Vue & InstanceType<typeof DateMixin>>).extend({
    components: {
      EventSparkline
    },
    props: {
      userId: {
        type: String,
        required: true,
      },
    },
    methods: {
      getEventQuery(): EventQuery {
        return new EventQuery({
          userid: this.userId
        })
      }
    }
  })
</script>
