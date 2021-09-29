<template>
  <div class="page">
    <component 
      :is="currentComponent"
      :widget="currentWidget"
    />
  </div>
</template>

<script>
import PageMixin from './page-mixin'
import Sandbox from './../Sandbox.vue'

// TODO: add plugins

export default {
  name: 'WidgetPage',
  components: {Sandbox},
  mixins: [PageMixin],
  computed: {
    widgetKind() {
      return this.widgets[0].kind
    },
    currentWidget() {
      return this.widgets[0]
    },
    currentComponent() {
      return this.widgetMap[this.widgetKind]
    }
  }
}
</script>

<style lang="sass">
  .page
    width: 100%
    display: flex
    flex-direction: column
    height: 100%
</style>