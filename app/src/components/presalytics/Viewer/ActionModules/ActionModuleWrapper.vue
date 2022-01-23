<template>
  <div id="action-module-wrapper">
    <v-card-title>
      {{ title }}
    </v-card-title>
    <v-card-subtitle>
      {{ subtitle}}
    </v-card-subtitle>
    <slot name="content"/>
    <v-card-actions>
      <slot name="actions" />
    </v-card-actions>
  </div>
</template>

<script>
  export default {
    name: 'ActionModuleWrapper',
    props: {
      title: {
        type: String,
        required: true
      },
      subtitle: {
        type: String,
        default: ''
      }
    }
  }
</script>