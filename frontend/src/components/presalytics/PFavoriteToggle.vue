<template>
  <v-btn
    icon
    class="favoriteButton"
    @click="toggleIsFavorite"
  >
    <v-icon
      class="favoriteIcon"
      :class="{ isfavorite: isFavorite}"
    >
      mdi-heart
    </v-icon>
  </v-btn>
</template>

<script>
  export default {
    props: {
      story: {
        type: Object,
        default () {
          return {
            isFavorite: false,
            id: null,
          }
        },
      },
    },
    computed: {
      isFavorite () {
        var result = false
        try {
          if (this.$props.story.item.id) {
            var annotation = this.$store.getters['stories/annotation'](this.$props.story.item.id)
            if (annotation) {
              result = annotation.isFavorite
            }
          }
        } finally {}
        return result
      },
    },
    methods: {
      toggleIsFavorite: async function (event) {
        await this.$store.dispatch('stories/toggleIsFavorite', this.$props.story.item.id)
      },
    },
  }
</script>

<style lang="sass" scoped>
  .isfavorite
    -webkit-text-fill-color: var(--v-error-base) !important
    -webkit-text-stroke-color: var(--v-error-base) !important
  .favoriteButton
    background-color: inherit !important
  .favoriteIcon
    -webkit-text-fill-color: white
    -webkit-text-stroke-width: 1px
    -webkit-text-stroke-color: grey
</style>
