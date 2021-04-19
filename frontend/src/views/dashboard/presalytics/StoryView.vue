<template>
  <v-container
    id="storyView"
    fluid
    tag="section"
  >
    <v-row>
      <v-col cols="12">
        <div>
          This will be the Story View Page for Story: {{ $route.params.storyId }}
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'StoryView',
  }
</script>
