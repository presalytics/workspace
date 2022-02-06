<template>
  <div id="action-module-wrapper">
    <v-card-title>
      {{ title }}
    </v-card-title>
    <v-card-subtitle>
      {{ subtitle }}
    </v-card-subtitle>
    <div class="content-container">
      <slot />
    </div>
    <v-card-actions>
      <slot name="actions">
        <v-spacer />
        <v-btn
          text
          color="error"
          @click="$emit('toggle-expansion-panel')"
        >
          Close
        </v-btn>
      </slot>
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
    },
  }
</script>

<style lang="sass">
  #action-module-wrapper
    flex-grow: 1
    flex-shrink: 1
    min-height: 0
    display: flex
    flex-direction: column
    align-items: stretch
    justify-content: center
  .content-container
    padding-left: 5px
    padding-right: 5px
    overflow-y: auto
    flex-grow: 1
    flex-shrink: 1
  .content-container::-webkit-scrollbar-track
    background-color: transparent
  .content-container::-webkit-scrollbar
    width: 12px
  .content-container::-webkit-scrollbar-thumb
    border-radius: 10px
    background-color: transparent
    background-clip: content-box
    border: 1px solid transparent
  .content-container:hover::-webkit-scrollbar-thumb
    background-color: var(--v-gray-lighten2)
</style>