
export default {
  props: {
    page: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    widgetMap: {
      'ooxml-file-object': () => import('@/components/presalytics/Viewer/Widgets/OoxmlWidget.vue')
    }
  }),
  computed: {
    name() {
      return this.page.name
    },
    widgets() {
      return this.page.widgets
    },
    kind() {
      return this.page.kind
    },
    plugins() {
      return this.page.plugins
    }
  },
  methods: {
    getWidgetComponent(widgetKind) {
      return this.widgetMap[widgetKind]
    },
    getImage() {
      throw new Error('The "getImage" method must be ovrridden in components that inherit from "page-mixin".')
    }
  },
}

