<template>
  <div class="page">
    <component 
      :is="currentComponent"
      :widget="currentWidget"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import PageMixin from '../mixins/page-mixin'
import WidgetMixin from '../mixins/widget-mixin'
import Sandbox from './../Sandbox.vue'
import StoryWidget from '@/objects/story/story-widget'

// TODO: add plugins

export default (Vue as VueConstructor<Vue & InstanceType<typeof PageMixin>>).extend({
  name: 'WidgetPage',
  components: {Sandbox},
  mixins: [PageMixin],
  computed: {
    widgetKind(): string {
      return this.widgets[0].kind
    },
    currentWidget(): StoryWidget  {
      return this.widgets[0]
    },
    currentComponent(): VueConstructor<Vue & ThisType<typeof WidgetMixin>> {
      return this.widgetComponent(this.widgetKind)
    }
  }
})
</script>

<style lang="sass">
  .page
    width: 100%
    display: flex
    flex-direction: column
    height: 100%
</style>