<template>
  <base-material-card
    color="primary"
    class="px-5 py-3"
  >
    <template #heading>
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
            <v-menu
              top
              :close-on-click="closeOnClick"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="success"
                  text
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon left>
                    mdi-plus
                  </v-icon>
                  Create
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in createActions"
                  :key="index"
                  @click="createActionClick(item.action)"
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
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
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            multi-sort
          >
            <template #item.isFavorite="{ item }">
              <p-favorite-toggle
                :story="{ item }"
              />
            </template>
            <template #item.updatedAt="{ item }">
              <p-friendly-date
                :timestamp="lastUpdated(item)"
              />
            </template>
            <template #item.collaborators="{ item }">
              <p-shared-with
                :story="{ item }"
              />
            </template>
            <template #item.view_count="{ item }">
              <p-story-view-counter
                :story="{ item }"
              />
            </template>
            <template #item.activity_last_90="{ item }">
              <p-story-activity-sparkline
                :story="{ item }"
              />
            </template>
            <template #item.actions="{ item }">
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
    <p-upload-pptx-modal />
  </base-material-card>
</template>

<script>
  import { mapMutations } from 'vuex'
  import { debounce, isEmpty } from 'lodash-es'
  import PFavoriteToggle from './PFavoriteToggle.vue'
  import PFriendlyDate from './PFriendlyDate.vue'
  import PSharedWith from './PSharedWith.vue'
  import PStoryViewCounter from './PStoryViewCounter.vue'
  import PStoryActivitySparkline from './PStoryActivitySparkline.vue'
  import PStoryActionsMenu from './PStoryActionsMenu.vue'
  import PStoryShareModal from './Dialogs/PStoryShareModal.vue'
  import PStoryDeleteModal from './Dialogs/PStoryDeleteModal.vue'
  import PStoryColumnManageModal from './Dialogs/PStoryColumnManageModal.vue'
  import MaterialCard from '@/components/base/MaterialCard.vue'
  import PUploadPptxModal from './Dialogs/PUploadPptxModal.vue'

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
      BaseMaterialCard: MaterialCard,
      PUploadPptxModal,
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
            value: 'updatedAt',
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
        createActions: [
          {
            title: 'Upload Presentation (.pptx)',
            action: 'upload-pptx'
          }
        ],
        closeOnClick: true,
        sortBy: 'updatedAt',
        sortDesc: true,
      }
    },
    computed: {
      storiesList () {
        var vm = this
        var storyIds = vm.$store.state.stories.storiesList
        return storyIds.map((cur) => {
          var story = vm.$store.getters['stories/story'](cur)
          story.userRole = this.getUserRole(story)
          return story
        })
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
                  var collaborator = vm.$store.state.stories.collaborators[ele]
                  var usr = vm.$store.getters['users/getUser'](collaborator.userId) || ''
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
    created () {
      var vm = this
      vm.$store.dispatch('stories/initTableColumns', vm.defaultHeaders.slice())
      this.loading = false
    },
    mounted () {
      this.setSearchFromQueryString()
      this.handleSearchChange()
      this.$store.dispatch('stories/initStories')
    },
    methods: {
      ...mapMutations('dialogs', {
        toggleModal: 'TOGGLE_MODAL',
      }),
      lastUpdated (story) {
        return story.updatedAt
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
      capitalize (lowercaseString) {
        if (typeof lowercaseString !== 'string') return ''
        return lowercaseString.charAt(0).toUpperCase() + lowercaseString.slice(1)
      },
      getUserRole (story) {
        var vm = this
        return story.collaborators.reduce((acc, ele) => {
          if (!acc) {
            var collaborator = vm.$store.state.stories.collaborators[ele]
            if (collaborator?.userId === vm.$store.getters.userId) {
              return this.capitalize(collaborator.permissionName)
            }
          }
        }, null)
      },
      createActionClick(actionName) {
        switch (actionName) {
          case('upload-pptx'): {
            this.toggleUploadPptxModal()
            break
          }
        }
      },
      toggleUploadPptxModal() {
        this.toggleModal({ name: 'PUploadPptxModal' })
      }
    },
  }
</script>
