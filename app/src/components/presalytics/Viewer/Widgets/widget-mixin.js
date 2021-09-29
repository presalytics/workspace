export default {
  props: {
    widget: {
      type: Object,
      required: true
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