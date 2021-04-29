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
            multi-sort
          >
            <template v-slot:item.user="{ item }">
              <p-user-card
                :user="{ item }"
              />
            </template>
            <template v-slot:item.lastActivity="{ item }">
              <p-friendly-date
                :timestamp="latestUserTimestamp(item)"
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
    },
    data () {
      return {
        defaultHeaders: [
          {
            text: 'User',
            value: 'user',
            show: true,
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
            value: 'recentActions',
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
        debouncedText: '',
        searchText: '',
      }
    },
    computed: {
      audienceList () {
        var db = this.$store.getters['users/userDb']
        return db.map((cur) => {
          cur.fullname = this.getFullname(cur)
          return cur
        }).filter((cur) => cur.id !== this.$store.getters.userId)
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
