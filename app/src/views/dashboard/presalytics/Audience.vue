<template>
  <v-container
    id="stories"
    fluid
    tag="section"
  >
    <v-row>
      <v-col cols="12">
        <p-audience-card />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import PAudienceCard from '@/components/presalytics/PAudienceCard.vue'
  export default {
    name: 'Audience',
    components: {
      PAudienceCard,
    },
  }
</script>
