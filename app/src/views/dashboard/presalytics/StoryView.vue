<template>
  <story-view-app :story-id="$route.params.storyId" />
</template>

<script> 
  import StoryViewApp from '../../../components/presalytics/Viewer/StoryViewApp.vue'
  
  export default {
    name: 'StoryView',
    components: {
      StoryViewApp,
    },
  }
</script>

