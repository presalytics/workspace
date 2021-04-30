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
    <v-container
      fluid
    >
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="searchText"
            label="Search"
            prepend-icon="mdi-magnify"
            clearable
            @input="handleSearchChange"
          />
        </v-col>
        <v-col
          cols="12"
          md="8"
        >
          <div class="float-right">
            <v-btn
              color="success"
              text
              @click="toggleCreateModal"
            >
              <v-icon left>
                mdi-plus
              </v-icon>
              Create
            </v-btn>
            <v-btn
              text
              @click="toggleColumnModal"
            >
              <v-icon
                left
              >
                mdi-view-column-outline
              </v-icon>
              Manage Columns
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            :headers="headers"
            :items="filteredStoriesList"
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
        </v-col>
      </v-row>
    </v-container>
    <p-story-share-modal />
    <p-story-delete-modal />
    <p-story-column-manage-modal />
  </base-material-card>
</template>

<script>
  import { mapMutations } from 'vuex'
  import { debounce, isEmpty } from 'lodash'
  import PFavoriteToggle from './PFavoriteToggle'
  import PFriendlyDate from './PFriendlyDate'
  import PSharedWith from './PSharedWith'
  import PStoryViewCounter from './PStoryViewCounter'
  import PStoryActivitySparkline from './PStoryActivitySparkline'
  import PStoryActionsMenu from './PStoryActionsMenu'
  import PStoryShareModal from './Dialogs/PStoryShareModal'
  import PStoryDeleteModal from './Dialogs/PStoryDeleteModal'
  import PStoryColumnManageModal from './Dialogs/PStoryColumnManageModal'

  export default {
    components: {
      PFavoriteToggle,
      PFriendlyDate,
      PSharedWith,
      PStoryViewCounter,
      PStoryActivitySparkline,
      PStoryActionsMenu,
      PStoryShareModal,
      PStoryDeleteModal,
      PStoryColumnManageModal,
    },
    data () {
      return {
        defaultHeaders: [
          {
            text: 'Story Name',
            value: 'title',
            show: true,
          },
          {
            text: 'Favorite',
            value: 'isFavorite',
            show: true,
          },
          {
            text: 'Shared With...',
            value: 'collaborators',
            show: true,
          },
          {
            text: 'Last Modified',
            value: 'updated_at',
            show: true,
          },
          {
            text: 'My Role',
            value: 'userRole',
            show: true,
          },
          {
            text: 'Views',
            value: 'view_count',
            show: true,
          },
          {
            text: 'Activity',
            value: 'activity_last_90',
            show: true,
          },
          {
            text: 'Actions',
            value: 'actions',
            show: true,
          },
        ],
        loading: true,
        searchText: '',
        debouncedText: '',
      }
    },
    computed: {
      storiesList () {
        var vm = this
        var stories = vm.$store.getters['stories/storiesList']
        var userId = vm.$store.getters['auth/userId']
        stories.forEach((cur, i, arr) => {
          if (cur.workspace?.annotations) {
            try {
              arr[i].isFavorite = cur.workspace.annotations.filter((ele) => ele.userId === userId)[0].is_favorite || false
            } catch {
              arr[i].isFavorite = false
            }
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
      headers () {
        return this.$store.getters['stories/table'].columns.filter((cur) => cur.show)
      },
      filteredStoriesList () {
        var vm = this
        if (vm.debouncedText === '') {
          return vm.storiesList
        } else {
          try {
            var filteredStories = vm.storiesList.filter((cur) => {
              if (cur.title) {
                if (cur.title.toLowerCase().includes(vm.debouncedText)) {
                  return true
                }
              }
              if (cur.collaborators) {
                var collaboratorNames = cur.collaborators.map((ele) => {
                  var usr = vm.$store.getters['users/getUser'](ele.user_id) || ''
                  if (usr) {
                    return usr.name
                  } else {
                    return ''
                  }
                }).join()
              }
              if (collaboratorNames.toLowerCase().includes(vm.debouncedText)) {
                return true
              }
              if (this.matchesKeyValuePairs(cur)) {
                return true
              }
              return false
            })
            return filteredStories
          } catch (err) {
            return vm.storiesList
          }
        }
      },
    },
    watch: {
      '$route.query.userId' () {
        this.setSearchFromQueryString()
      },
    },
    async created () {
      var vm = this
      vm.$store.dispatch('stories/initTableColumns', vm.defaultHeaders.slice())
      this.loading = false
    },
    mounted () {
      this.setSearchFromQueryString()
      this.handleSearchChange()
    },
    methods: {
      ...mapMutations('dialogs', {
        toggleModal: 'TOGGLE_MODAL',
      }),
      lastUpdated (story) {
        return story.updated_at
      },
      toggleColumnModal () {
        this.toggleModal({ name: 'PStoryManageColumnsModal' })
      },
      toggleCreateModal () {
        alert('open upload modal')
      },
      handleSearchChange () {
        var setSearch = debounce(() => {
          this.debouncedText = this.searchText ? this.searchText.toLowerCase() : ''
        }, 1000)
        setSearch()
      },
      matchesKeyValuePairs (story) {
        var kvp = this.getKeyValueSearchPairs()
        if (isEmpty(kvp)) {
          return false
        }
        var userIdMatch = kvp.userid ? this.isUserIdMatch(kvp.userid, story) : false
        return userIdMatch
      },
      getKeyValueSearchPairs () {
        var re = /([\w-]+):([^,]+)/g
        var m
        var map = {}

        while ((m = re.exec(this.debouncedText)) != null) {
          map[m[1]] = m[2]
        }
        return map
      },
      isUserIdMatch (userId, story) {
        if (story.collaborators) {
          return story.collaborators.reduce((acc, cur) => {
            if (!acc) {
              if (cur.user_id === userId) {
                acc = true
              }
            }
            return acc
          }, false)
        } else {
          return false
        }
      },
      setSearchFromQueryString () {
        if (this.$route.query.userId) {
          this.searchText = 'userId:' + this.$route.query.userId
        }
      },
    },
  }
</script>
