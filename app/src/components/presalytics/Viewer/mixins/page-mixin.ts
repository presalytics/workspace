import Vue, { VueConstructor, PropType } from 'vue'
import StoryPage from '@/objects/story/story-page'
import StoryWidget from '@/objects/story/story-widget'
import StoryPlugin from '@/objects/story/story-plugin'
import WidgetMixin from './widget-mixin'
import OoxmlWidget from '@/components/presalytics/Viewer/Widgets/OoxmlWidget.vue'

const widgetMap: Record<string, VueConstructor<Vue & ThisType<typeof WidgetMixin>>> = {
  'ooxml-file-object': OoxmlWidget
}

export default Vue.extend({
  props: {
    page: {
      type: Object as PropType<StoryPage>,
      required: true
    }
  },
  computed: {
    name(): string {
      return this.page.elementName
    },
    widgets(): Array<StoryWidget> {
      return this.page.widgets
    },
    kind(): string {
      return this.page.kind
    },
    plugins(): Array<StoryPlugin> {
      return this.page.plugins
    },
    currentComponent(): VueConstructor<Vue> {
      return widgetMap[this.kind]
    }
  },
  methods: {
    widgetComponent(widgetKind: string): VueConstructor<Vue> {
      if (!(widgetKind in widgetMap)) {
        throw new Error('Widget kind "' + widgetKind + '" does not exist or cannot be rendered by this application')
      } 
      return widgetMap[widgetKind]
    },
    getImage(): string {
      throw new Error('The "getImage" method must be ovrridden in components that inherit from "page-mixin".')
    }
  },
})

