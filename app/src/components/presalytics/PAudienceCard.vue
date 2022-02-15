<template>
  <base-material-card
    color="primary"
    class="px-5 py-3"
  >
    <template #heading>
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
            <template #item.appMetadata.apiUserId="{ item }">
              <p-user-card
                :user="{ item }"
              />
            </template>
            <template #item.lastActivity="{ item }">
              <p-friendly-date
                :timestamp="latestUserTimestamp(item)"
              />
            </template>
            <template #item.stories="{ item }">
              <p-audience-story-summary
                :user="item"
              />
            </template>
            <template #item.notifySwitch="{ item }">
              <p-user-notification-toggle
                :user-id="item.appMetadata.apiUserId"
              />
            </template>
            <template #item.view_count="{item}">
              <p-user-view-counter
                :user-id="item.appMetadata.apiUserId"
              />
            </template>
            <template #item.activity="{item}">
              <p-user-activity-sparkline
                :user-id="item.appMetadata.apiUserId"
              />
            </template>
            <template #item.recentEvents="{item}">
              <p-user-recent-events
                :user-id="item.appMetadata.apiUserId"
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
  import PAudienceColumnManageModal from './Dialogs/PAudienceColumnManageModal.vue'
  import PUserCard from './PUserCard.vue'
  import PFriendlyDate from './PFriendlyDate.vue'
  import PAudienceStorySummary from './PAudienceStorySummary.vue'
  import PUserNotificationToggle from './PUserNotificationToggle.vue'
  import PUserViewCounter from './PUserViewCounter.vue'
  import PUserActivitySparkline from './PUserActivitySparkline.vue'
  import PUserRecentEvents from './PUserRecentEvents.vue'
  import MaterialCard from '@/components/base/MaterialCard.vue'


  export default {
    components: {
      PAudienceColumnManageModal,
      PUserCard,
      PFriendlyDate,
      PAudienceStorySummary,
      PUserNotificationToggle,
      PUserViewCounter,
      PUserActivitySparkline,
      PUserRecentEvents,
      BaseMaterialCard: MaterialCard,
    },
    data () {
      return {
        defaultHeaders: [
          {
            text: 'User',
            value: 'appMetadata.apiUserId',
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
        sortBy: ['appMetadata.apiUserId'],
        sortDesc: [false],

      }
    },
    computed: {
      userList () {
        return this.$store.getters['users/userList']
      },
      audienceList () {
        return this.userList
            .filter((cur) => {
              return cur !== this.$store.getters.userId
            })
            .map((cur) => {
              return this.$store.getters['users/getUser'](cur)
            })
      },
      filteredAudienceList () {
        return this.audienceList.filter(() => this.isUserMatchtoQuery(this.debouncedText))
      },
      headers () {
        return this.$store.getters['users/table'].columns.map( (cur) => {
          return this.defaultHeaders.filter( (header) => header.value === cur)[0]
        })
      },
    },
    async created () {
      var headerValues = this.defaultHeaders.map( (cur) => cur.value)
      this.initColumns(headerValues)
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
          var fullname = this.$store.getters['users/getFriendlyName'](user.id)
          if (fullname.includes(queryText) || user.email.includes(queryText) || user.appMetadata.apiUserId === queryText || user.nickname.includes(queryText)) {
            return true
          }
          return false
        } else {
          return true
        }
      },
      getUserEvents () {
        throw new Error('make get user events function')
      },
      getLatestEvent (eventList) {
        return eventList.reduce((acc, cur) => {
          var currentTS = new Date(cur.time)
          var accTS = new Date(acc.time)
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
          return this.getLatestEvent(evts).time
        } else {
          return ''
        }
      },

    },
  }
</script>
