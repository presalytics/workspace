<template>
  <p-modal-base
    v-model="modalProps"
    :title="title"
    :name="name"
    color="primary"
    @change="onModalStateChange"
  >
    <v-container
      fluid
    >
      <v-row>
        <v-col cols="12">
          <h4>Select User(s) to Add to Story</h4>
          <p class="body-1">
            Story Name: {{ storyTitle }}
          </p>
          <v-autocomplete
            v-model="selectedUsers"
            :items="userList"
            dense
            chips
            small-chips
            label="User Search"
            multiple
            solo
            hint="Search by Name, Email or Presalytics User Id"
            :loading="loading"
            item-value="id"
            item-text="fullname"
            :filter="filter"
            class="pa-3"
          >
            <template #item="{ item }">
              <v-list-item-icon>
                <v-avatar
                  size="48px"
                >
                  <img
                    :src="item.picture"
                  >
                </v-avatar>
              </v-list-item-icon>
              <v-list-item-content>
                <p class="mt-1 body-1">
                  {{ getFullname(item) }}
                </p>
                <p class="caption mb-1">
                  <template v-if="isCurrentUser(item)">
                    Already a collaborator
                  </template>
                  <template v-else>
                    {{ item.email }}
                  </template>
                </p>
              </v-list-item-content>
            </template>
            <template #no-data>
              <div
                v-if="searchIsEmail"
                class="d-flex pa-2"
              >
                <v-btn
                  icon
                  fab
                  small
                  color="primary"
                  class="plus-button"
                  @click="sendInvitetoNetwork"
                >
                  <v-icon color="white">
                    mdi-plus
                  </v-icon>
                </v-btn>
                <div class="d-flex flex-column">
                  <div class="flex-grow-1" />
                  <span>{{ getInviteMessage() }}</span>
                  <div class="flex-grow-1" />
                </div>
                <div class="flex-grow-1" />
              </div>
              <div
                v-else
                class="pa-2"
              >
                No matching users found
              </div>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-container>
    <template #actions>
      <v-btn
        text
        color="success"
        :disabled="hasSelection"
        @click="handleAddUsersClick"
      >
        Add Selected Users
      </v-btn>
    </template>
  </p-modal-base>
</template>

<script>
  import { debounce } from 'lodash'
  import EmailValidator from 'email-validator'
  import PModalBase from './PModalBase.vue'
  
  export default {
    components: {
      PModalBase,
    },
    data: () => ({
      modalProps: {},
      name: 'PStoryShareModal',
      title: 'Share With a Colleague',
      debouncedSearchText: '',
      searchText: '',
      loading: false,
      selectedUsers: [],
      userList: [],
    }),
    computed: {
      storyId () {
        if (this.modalProps) {
          return this.modalProps.storyId
        } else {
          return ''
        }
      },
      story () {
        if (this.storyId) {
          return this.$store.getters['stories/story'](this.storyId)
        } else {
          return null
        }
      },
      storyTitle () {
        if (this.story) {
          return this.story.title || ''
        } else {
          return ''
        }
      },
      searchIsEmail () {
        return this.validateEmail(this.debouncedSearchText)
      },

      currentUserIds () {
        if (this.storyId) {
          var vm = this
          var story = vm.$store.getters['stories/story'](vm.storyId)
          return story.collaborators.filter((cur) => cur.user_id).map((cur) => cur.user_id)
        } else {
          return []
        }
      },
      hasSelection () {
        return this.selectedUsers.length === 0
      },
    },
    methods: {
      validateEmail (email) {
        if (email) {
          return EmailValidator.validate(email)
        } else {
          return false
        }
      },
      isCurrentUser (user) {
        var vm = this
        return vm.currentUserIds.includes(user.id)
      },
      getFullname (user) {
        if (user.given_name && user.family_name) {
          return user.given_name + ' ' + user.family_name
        } else {
          return user.nickname
        }
      },
      reset () {
        this.debouncedSearchText = ''
        this.searchText = ''
        this.loading = false
        this.selectedUsers = []
        this.userList = []
      },
      onModalStateChange () {
        if (this.modalProps) {
          this.userList = this.getUserList()
        } else {
          this.reset()
        }
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
      filter (item, queryText) {
        var setSearch = debounce(() => {
          this.debouncedSearchText = queryText.toLowerCase().trim()
        }, 1000)
        setSearch()
        return this.isUserMatchtoQuery(item, this.debouncedSearchText)
      },
      handleAddUsersClick () {
        alert('Add Api call for adding a collaborator')
      },
      getUserList () {
        var usrs = this.$store.getters['users/userDb']
        return usrs.map((cur) => {
          cur.fullname = this.getFullname(cur)
          return cur
        })
      },
      getInviteMessage () {
        return 'Invite ' + this.debouncedSearchText + ' to join your Presalytics network'
      },
      sendInvitetoNetwork () {
        alert('Add user via email api call')
      },
    },
  }
</script>

<style lang="sass" scoped>
  .scrollWindow
    display: flex
    max-height: 400px
    overflow-y: auto
    flex-direction: column
  .userContainer
    display: flex
    max-height: 60px
    flex-direction: row
    padding: 0.5rem
  .userPicture
    flex-basis: 60px
    max-width: 60px
  .userInfo
    display: flex
    flex-grow: 1
    flex-direction: column
    padding-left: 1rem
  .userName
    flex-grow: 1
    font-weight: 700
  .userMessage
    flex-grow: 1
    font-weight: 300
    color: greyscale(var(--v-primary-lighten-3))
  .plus-button
    background-color: var(--v-success-base) !important

</style>
