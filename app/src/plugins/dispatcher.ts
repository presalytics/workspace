import ApiEvent from '@/objects/api-event'
import { CloudEvent } from 'cloudevents'
import { v4 as uuidv4 } from 'uuid'
import ApiEventWorker from '@/workers/api-events?worker'
import { ApiEventWorkerMessage, ApiEventWorkerResponseType } from '@/objects/api-event/api-event-worker-message'
import Vue, { VueConstructor } from 'vue'
import { getString } from '@/objects/util'

const apiEventWorker = new ApiEventWorker()

export class RegistryItem {
  type: string
  action: string

  constructor(type: string, action: string) {
    this.type = type
    this.action = action
  }
}

const defaultRegistry: Array<RegistryItem> = [
  {
    type: "story.created",
    action: "stories/initStories"
  },
  {
    type: "story.deleted",
    action: "stories/deleteStory"
  },
  {
    type: "story.png_created",
    action: "images/sendToWorkerThread"
  },
  {
    type: "story.svg_created",
    action: "images/sendToWorkerThread"
  }
]

export const Dispatcher = Vue.extend({
  name: 'Dispatcher',
  data() {
    return {
      registry: [] as Array<RegistryItem>,
      apiEventWorker: apiEventWorker
    }
  },
  created(): void {
    defaultRegistry.forEach( (cur: RegistryItem) => this.subscribe(cur))
    this.apiEventWorker.addEventListener('message', this.handleApiEvent)
  },
  beforeDestroy(): void {
    this.apiEventWorker.removeEventListener('message', this.handleApiEvent)
  },
  methods: {
    handleApiEvent(e: MessageEvent) {
      if (e.data.type === 'REFRESH_AUTH') {
        this.refreshAuth()
      } else {
        const workerMessage = <ApiEventWorkerMessage>e.data
        switch (workerMessage.type) {
          case (ApiEventWorkerResponseType.QueryResult): {
            let eventName = "event-query-result"
            if (workerMessage.query !== null ) {
              eventName += "-" + workerMessage.query.id
            }
            this.$emit(eventName, workerMessage)
            break
          }
          case (ApiEventWorkerResponseType.NewEvent): {
            workerMessage.events.forEach( (cur: ApiEvent) => this.$emit(cur.type, cur))
            break
          }
          default: {
            throw new Error(`Dispatcher does not know how to handle "${workerMessage.type}" type messages from the ApiEventWorker`)
          }
        }
      }
    },
    async refreshAuth() {
      const accessToken = await this.$auth.getTokenSilently()
      const message = {accessToken: accessToken}
      this.apiEventWorker.postMessage(message)
    },
    subscribe(newRegistryItem: RegistryItem) {
      this.registry.push(newRegistryItem)
    },
     // component level api actions... must be unsubscribed on component beforeDistroy() if operation should not continue
    unsubscribe(destroyRegistryItem: RegistryItem) {
      const record = this.registry.find( (cur) => cur.type == destroyRegistryItem.type && cur.action == destroyRegistryItem.action)
      if (record) {
        const index = this.registry.indexOf(record)
        this.registry.splice(index, 1)
      }
    },
    emitApiEvent(type: string, model: unknown, subject?: string) {
      const evt = new CloudEvent<unknown>({
        type: type,
        data: {
          resourceId: getString(model, "id"),
          userId: this.$store.getters.userId,
          model: model
        },
        subject: typeof subject === 'undefined' ? getString(model, "id") : subject,
        time: new Date().toISOString(),
        id: uuidv4(),
        source: window.location.origin,
        datacontenttype: "application/json"
      })
      this.dispatchApiEvent(evt)
    },
    dispatchApiEvent(evt: CloudEvent<unknown>) {
      this.apiEventWorker.postMessage({
        request: 'sendEvent',
        eventData: evt.toJSON()
      })
    }
  }
})

let instance: InstanceType<typeof Dispatcher> | null = null

export default class DispatcherPlugin{
  static install(Vue: VueConstructor) {
    if (instance) {
      return instance
    } else {
      instance = new Dispatcher()
      Vue.prototype.$dispatcher = instance
    }
    return instance
  }
}