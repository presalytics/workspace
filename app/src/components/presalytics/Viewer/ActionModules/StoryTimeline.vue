<template>

</template>

<script>
  import Vue from 'vue'
  import actionModuleMixin from "./action-module-mixin";
  import ActionModuleWrapper from './ActionModuleWrapper.vue';

  export default Vue.extend({
    name: 'StoryTimeline',
    mixins: [actionModuleMixin],
    components: {
      ActionModuleWrapper,
      EventTimeline
    }
  })
</script>