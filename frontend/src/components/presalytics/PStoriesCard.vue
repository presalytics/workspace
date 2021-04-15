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
        Collaborate with your collegues on content
      </div>
    </template>

    <v-data-table
      :headers="headers"
      :items="storiesList"
      multi-sort
    >
      <template v-slot:item.isFavorite="{ item }">
        <p-favorite-toggle
          :story="{ item }"
        />
      </template>
      <template v-slot:item.updated_at="{ item }">
        <p-friendly-date
          :timestamp="lastUpdated(item)"
        />
      </template>
      <template v-slot:item.collaborators="{ item }">
        <p-shared-with
          :story="{ item }"
        />
      </template>
      <template v-slot:item.view_count="{ item }">
        <p-story-view-counter
          :story="{ item }"
        />
      </template>
      <template v-slot:item.activity_last_90="{ item }">
        <p-story-activity-sparkline
          :story="{ item }"
        />
      </template>
      <template v-slot:item.actions="{ item }">
        <p-story-actions-menu
          :story="{ item }"
        />
      </template>
    </v-data-table>
  </base-material-card>
</template>

<script>
  import PFavoriteToggle from './PFavoriteToggle'
  import PFriendlyDate from './PFriendlyDate'
  import PSharedWith from './PSharedWith'
  import PStoryViewCounter from './PStoryViewCounter'
  import PStoryActivitySparkline from './PStoryActivitySparkline'
  import PStoryActionsMenu from './PStoryActionsMenu'

  export default {
    components: {
      PFavoriteToggle,
      PFriendlyDate,
      PSharedWith,
      PStoryViewCounter,
      PStoryActivitySparkline,
      PStoryActionsMenu,
    },
    data () {
      return {
        headers: [
          {
            text: 'Story Name',
            value: 'title',
          },
          {
            text: 'Favorite',
            value: 'isFavorite',
          },
          {
            text: 'Shared With...',
            value: 'collaborators',
          },
          {
            text: 'Last Modified',
            value: 'updated_at',
          },
          {
            text: 'My Role',
            value: 'userRole',
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
      storiesList () {
        var vm = this
        var stories = vm.$store.getters['stories/storiesList']
        var userId = vm.$store.getters['auth/userId']
        stories.forEach((cur, i, arr) => {
          if (cur.workspace?.annotations) {
            arr[i].isFavorite = cur.workspace.annotations.filter((ele) => ele.userId === userId)[0].is_favorite || false
          } else {
            arr[i].isFavorite = false
          }
          var collaborator = cur.collaborators.filter((ele) => ele.user_id === userId)[0]
          if (collaborator?.permission_type?.name) {
            var capitalize = (lowercaseString) => {
              if (typeof lowercaseString !== 'string') return ''
              return lowercaseString.charAt(0).toUpperCase() + lowercaseString.slice(1)
            }
            var roleName = cur.collaborators.filter((ele) => ele.user_id === userId)[0].permission_type.name
            arr[i].userRole = capitalize(roleName)
          }
        })
        return stories
      },
    },
    async created () {
      await Promise.all([
        this.$store.dispatch('stories/initStories'),
        this.$store.dispatch('users/initUsers'),
      ])
      this.loading = false
    },
    methods: {
      lastUpdated (story) {
        return story.updated_at
      },
    },
  }
</script>
