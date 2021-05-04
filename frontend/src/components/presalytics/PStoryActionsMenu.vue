<template>
  <v-menu
    :close-on-content-click="closeOnContentClick"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        color="success"
        dark
        v-bind="attrs"
        v-on="on"
      >
        Actions
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        class="menuItem"
        @click="handleMenuAction(item.action)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  import { mapActions, mapMutations } from 'vuex'

  var copyToClipboard = (text) => {
    var dummy = document.createElement('textarea')
    // to avoid breaking orgain page when copying more words
    // cant copy when adding below this code
    // dummy.style.display = 'none'
    document.body.appendChild(dummy)
    // Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
    dummy.value = text
    dummy.select()
    document.execCommand('copy')
    document.body.removeChild(dummy)
  }
  export default {
    props: {
      story: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      items: [
        { title: 'View Story', action: 'viewStory' },
        { title: 'Share', action: 'shareStory' },
        { title: 'Copy Story Id to Clipboard', action: 'copyId' },
        { title: 'See Story Events', action: 'viewStoryEvents' },
        { title: 'Delete Story', action: 'deleteStory' },
      ],
      closeOnContentClick: true,
    }),
    methods: {
      ...mapActions('alerts', ['setAlert']),
      ...mapMutations('dialogs', {
        toggleModal: 'TOGGLE_MODAL',
      }),
      handleMenuAction (actionName) {
        var storyId = this.$props.story.item.id
        switch (actionName) {
          case ('viewStory'): {
            this.$router.push({ name: 'Story View', params: { storyId: storyId } })
            break
          }
          case ('shareStory'): {
            this.toggleModal({ name: 'PStoryShareModal', properties: { storyId: storyId } })
            break
          }
          case ('copyId'): {
            copyToClipboard(storyId)
            var message = 'Story With Id ' + storyId + ' copied to clipboard'
            this.setAlert({ type: 'success', message: message, timeout: 7000 })
            break
          }
          case ('viewStoryEvents'): {
            this.$router.push('events?storyId=' + storyId)
            break
          }
          case ('deleteStory'): {
            this.toggleModal({ name: 'PStoryDeleteModal', properties: { storyId: storyId } })
            break
          }
        }
      },
    },
  }
</script>

<style lang="sass" scoped>
  .listItem:hover
    background-color: gray
</style>
