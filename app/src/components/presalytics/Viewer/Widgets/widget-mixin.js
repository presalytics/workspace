export default {
  props: {
    widget: {
      type: Object,
      required: true
    },
    thumbnail: {
      type: Boolean,
      default: () => false
    }
  },
  computed: {
    kind() {
      return this.widget.kind
    },
    name() {
      return this.widget.name
    },
    plugins() {
      return this.widget.plugins
    }
  }
}