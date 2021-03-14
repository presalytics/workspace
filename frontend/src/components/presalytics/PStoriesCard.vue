<template>
  <base-material-card
    color="primary"
    class="px-5 py-3"
  >
    <template v-slot:heading>
      <div class="display-2 font-weight-light">
        My Stories
      </div>

      <div class="subtitle-1 font-weight-light">
        Content creted by you and for you
      </div>
    </template>

    <v-data-table
      :headers="headers"
      :items="storiesList"
      multi-sort
    >
    </v-data-table>>
  </base-material-card>
</template>
<script>
  export default {
    data () {
      return {
        headers: [
          {
            text: 'Story Name',
            value: 'name'
          },
          {
            text: 'Favorite',
            value: 'is_favorite'
          },
          {
            text: 'Shared With...',
            value: 'collaborator_ids'
          },
          {
            text: 'Last Modified',
            value: 'updated_at'
          },
          {
            text: 'My Role',
            value: 'role'
          },
          {
            text: 'Views',
            value: 'view_count'
          },
          {
            text: 'Activity',
            value: 'activity_last_90'
          },
          {
            text: 'Actions',
            value: 'actions'
          },
        ],
        loading: true
      },
    },
    computed: {
      storiesList () {
        return this.$store.state.stories.list
      }
    },
    created () {
      await this.$store.dispatch('initStories')
      this.loading = false;
    }
}
</script>
  