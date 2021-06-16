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
              @click="toggleInviteModal"
            >
              <v-icon left>
                mdi-plus
              </v-icon>
              Invite
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
            :items="filteredAudienceList"
            :sort-by="sortBy"
            :sort-desc="sortDesc"
            multi-sort
          >
            <template v-slot:item.app_metadata.api_user_id="{ item }">
              <p-user-card
                :user="{ item }"
              />
            </template>
            <template v-slot:item.lastActivity="{ item }">
              <p-friendly-date
                :timestamp="latestUserTimestamp(item)"
              />
            </template>
            <template v-slot:item.stories="{ item }">
              <p-audience-story-summary
                :user="item"
              />
            </template>
            <template v-slot:item.notifySwitch="{ item }">
              <p-user-notification-toggle
                :user-id="item.app_metadata.api_user_id"
              />
            </template>
            <template v-slot:item.view_count="{item}">
              <p-user-view-counter
                :user-id="item.app_metadata.api_user_id"
              />
            </template>
            <template v-slot:item.activity="{item}">
              <p-user-activity-sparkline
                :user-id="item.app_metadata.api_user_id"
              />
            </template>
            <template v-slot:item.recentEvents="{item}">
              <p-user-recent-events
                :user-id="item.app_metadata.api_user_id"
              />
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
    <p-audience-column-manage-modal />
  </base-material-card>
</template>

<script>
  import { mapMutations } from 'vuex'
  import { debounce } from 'lodash'

  export default {
    components: {
      PAudienceColumnManageModal: () => import('./Dialogs/PAudienceColumnManageModal'),
      PUserCard: () => import('./PUserCard'),
      PFriendlyDate: () => import('./PFriendlyDate'),
      PAudienceStorySummary: () => import('./PAudienceStorySummary'),
      PUserNotificationToggle: () => import('./PUserNotificationToggle'),
      PUserViewCounter: () => import('./PUserViewCounter'),
      PUserActivitySparkline: () => import('./PUserActivitySparkline'),
      PUserRecentEvents: () => import('./PUserRecentEvents'),
    },
    data () {
      return {
        defaultHeaders: [
          {
            text: 'User',
            value: 'app_metadata.api_user_id',
            show: true,
            sort: (a, b) => {
              var aUser = this.$store.getters['users/getUser'](a)
              var bUser = this.$store.getters['users/getUser'](b)
              var aName = aUser.family_name || aUser.nickname
              var bName = bUser.family_name || bUser.nickname
              if (aName < bName) {
                return -1
              } else if (aName > bName) {
                return 1
              } else {
                return 0
              }
            },
          },
          {
            text: 'Last Activity',
            value: 'lastActivity',
            show: true,
          },
          {
            text: 'Stories',
            value: 'stories',
            show: true,
          },
          {
            text: 'Recent Actions',
            value: 'recentEvents',
            show: true,
          },
          {
            text: 'Notifications',
            value: 'notifySwitch',
            show: true,
          },
          {
            text: 'Views',
            value: 'view_count',
            show: true,
          },
          {
            text: 'Activity',
            value: 'activity',
            show: true,
          },
        ],
        loading: true,
        debouncedText: '',
        searchText: '',
        sortBy: ['app_metadata.api_user_id'],
        sortDesc: [false],

      }
    },
    computed: {
      userList () {
        return this.$store.state.users.userList
      },
      audienceList () {
        return this.userList.map((cur) => {
          var user = this.$store.state.users.users[cur]
          user.fullname = this.getFullname(user)
          return user
        }).filter((cur) => cur.app_metadata.api_user_id !== this.$store.getters.userId)
      },
      filteredAudienceList () {
        return this.audienceList.filter((cur) => this.isUserMatchtoQuery(this.debouncedText))
      },
      headers () {
        return this.$store.getters['users/table'].columns.filter((cur) => cur.show)
      },
    },
    async created () {
      this.initColumns(this.defaultHeaders)
      this.loading = false
    },
    mounted () {
      this.$store.dispatch('users/initUsers')
      this.handleSearchChange()
    },
    methods: {
      ...mapMutations('users', {
        initColumns: 'ADD_TABLE_COLUMNS',
      }),
      ...mapMutations('dialogs', {
        toggleModal: 'TOGGLE_MODAL',
      }),
      lastUpdated (story) {
        return story.updated_at
      },
      toggleColumnModal () {
        this.toggleModal({ name: 'PAudienceColumnManageModal' })
      },
      toggleInviteModal () {
        alert('open upload modal')
      },
      handleSearchChange () {
        var setSearch = debounce(() => {
          this.debouncedText = this.searchText.toLowerCase()
        }, 1000)
        setSearch()
      },
      isUserMatchtoQuery (user, queryText) {
        if (user && queryText) {
          var fullname = this.getFullname(user)
          if (fullname.includes(queryText) || user.email.includes(queryText) || user.app_metadata.api_user_id === queryText || user.nickname.includes(queryText)) {
            return true
          }
          return false
        } else {
          return true
        }
      },
      getFullname (user) {
        if (user.given_name && user.family_name) {
          return user.given_name + ' ' + user.family_name
        } else {
          return user.nickname
        }
      },
      getUserEvents (user) {
        var vm = this
        var db = vm.$store.getters['apiEvents/eventsDb']
        return db.filter((cur) => {
          if (cur.resourceId === user.id) {
            return true
          }
          if (cur.relationships?.userId) {
            if (cur.relationships.userId === user.id) {
              return true
            }
          }
          return false
        })
      },
      getLatestEvent (eventList) {
        return eventList.reduce((acc, cur) => {
          var currentTS = new Date(cur.timeStampUTC)
          var accTS = new Date(acc.timeStampUTC)
          if (currentTS > accTS) {
            return cur
          } else {
            return acc
          }
        }, eventList[0])
      },
      latestUserTimestamp (user) {
        var evts = this.getUserEvents(user)
        if (evts?.length > 0) {
          return this.getLatestEvent(evts).timeStampUTC
        } else {
          return ''
        }
      },

    },
  }
</script>
