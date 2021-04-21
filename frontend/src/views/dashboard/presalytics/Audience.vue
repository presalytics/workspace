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
  export default {
    name: 'Stories',
    components: {
      PAudienceCard: () => import('../../../components/presalytics/PAudienceCard'),
    },
  }
</script>
