<template>
  <base-material-card
    color="primary"
    class="px-5 py-3"
  >
    <template v-slot:heading>
      <div class="display-2 font-weight-light">
        My Audience
      </div>

      <div class="subtitle-1 font-weight-light">
        The people you build and share content with
      </div>
    </template>

    <v-data-table
      :headers="headers"
      :items="audienceList"
      multi-sort
    >
      <template v-slot:item.isFavorite="{ item }">
        <p-favorite-toggle
          :story="{ item }"
        />
      </template>
    </v-data-table>
  </base-material-card>
</template>

<script>

  export default {
    data () {
      return {
        headers: [
          {
            text: 'Name',
            value: 'userName',
          },
          {
            text: 'Last Activity',
            value: 'lastActivity',
          },
          {
            text: 'Stories',
            value: 'stories',
          },
          {
            text: 'Recent Actions',
            value: 'recentActions',
          },
          {
            text: 'Notifications',
            value: 'notifySwitch',
          },
          {
            text: 'Views',
            value: 'view_count',
          },
          {
            text: 'Activity',
            value: 'activity_last_90',
          },
          {
            text: 'Actions',
            value: 'actions',
          },
        ],
        loading: true,
      }
    },
    computed: {
      audienceList () {
        return []
      },
    },
    async created () {
      this.loading = false
    },
    methods: {
      lastUpdated (story) {
        return story.updated_at
      },
    },
  }
</script>
