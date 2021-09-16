<template>
  <v-container
    id="stories"
    fluid
    tag="section"
  >
    <v-row>
      <v-col cols="12">
        <p-stories-card />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import PStoriesCard from '../../components/presalytics/PStoriesCard.vue'
  export default {
    name: 'Stories',
    components: {
      PStoriesCard,
    },
  }
</script>
