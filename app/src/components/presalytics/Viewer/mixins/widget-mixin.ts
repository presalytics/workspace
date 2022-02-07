import Vue, { PropType } from 'vue'
import StoryWidget from '@/objects/story/story-widget'
import StoryPlugin from '@/objects/story/story-plugin'

export default Vue.extend({
  props: {
    widget: {
      type: Object as PropType<StoryWidget>,
      required: true
    },
    thumbnail: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    kind(): string {
      return this.widget.kind
    },
    name(): string {
      return this.widget.elementName
    },
    plugins(): Array<StoryPlugin> {
      return this.widget.plugins
    },
    widgetData(): unknown {
      return this.widget.data
    } 
  }
})
