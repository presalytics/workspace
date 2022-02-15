<template>
  <v-sparkline
    v-if="!isLoading"
    :value="value"
    :gradient="gradient"
    :smooth="radius || false"
    :padding="padding"
    :line-width="width"
    :stroke-linecap="lineCap"
    :gradient-direction="gradientDirection"
    :fill="fill"
    :type="type"
    :auto-line-width="autoLineWidth"
    auto-draw
  />  
</template>

<script lang="ts">
import DateMixin from '@/mixins/date-mixin'
import EventQuery from '@/objects/api-event/event-query'
import ApiEvent from '@/objects/api-event'
import ApiEventWorkerMessage from '@/objects/api-event/api-event-worker-message'
import Vue, { VueConstructor, PropType } from 'vue'

export default (Vue as VueConstructor<Vue & InstanceType<typeof DateMixin>>).extend({
  mixins: [DateMixin],
  props: {
    query: {
      type: Object as PropType<EventQuery>,
      required: true
    }
  },
  data() {
    return {
      width: 8,
      radius: 25,
      padding: 8,
      lineCap: 'round',
      gradient: ['#f72047', '#ffd200', '#c1c1c1'],
      gradientDirection: 'top',
      fill: false,
      type: 'trend',
      autoLineWidth: false,
      isLoading: true,
      value: [] as Array<number>
    }
  },
  created(){
    this.$dispatcher.$on(this.getEventName(), this.handleQueryResult)
    this.sendQuery()
  },
  beforeDestroy() {
    this.$dispatcher.$off(this.getEventName(), this.handleQueryResult)
  },
  methods: {
    handleQueryResult(message: ApiEventWorkerMessage): void {
      this.value = this.queryResultToValue(message)
      this.isLoading = false
    },
    getEventName(): string {
      return "event-query-result-" + this.query.id
    },
    sendQuery(): void {
      this.$dispatcher.apiEventWorker.postMessage({
        request: 'search',
        query: this.query
      })
    },
    queryResultToValue(e: unknown): Array<number> {
      const message = ApiEventWorkerMessage.fromJSON(e)
      const dates = this.getDaysArray(this.getTimeWindowFn()(), new Date())
      return dates.map((cur: Date) => this.countByDay(message.events, cur, (ele: ApiEvent) => this.getEventDate(ele)))
    },
    getEventDate(evt : ApiEvent): Date {
      return evt.time
    }
  },
})

</script>
