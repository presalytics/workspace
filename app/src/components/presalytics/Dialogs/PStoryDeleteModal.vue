<template>
  <p-modal-base
    ref="base"
    v-model="modalProps"
    :name="name"
    color="error"
    :title="title"
  >
    <v-card-text>
      Are you sure you want to delete the story
      <strong class="font-weight-bold">
        {{ storyTitle }}
      </strong>?
    </v-card-text>

    <template #actions>
      <v-btn
        color="error"
        @click="deleteStory"
      >
        Yes, Delete Story
      </v-btn>
    </template>
  </p-modal-base>
</template>

<script>
  import PModalBase from './PModalBase.vue'

  export default {
    components: {
      PModalBase,
    },
    data: () => ({
      title: 'Delete Story?',
      name: 'PStoryDeleteModal',
      modalProps: {},
    }),
    computed: {
      story () {
        return this.modalProps?.storyId ? this.$store.getters['stories/story'](this.modalProps.storyId) : null
      },
      storyTitle () {
        return this.story ? this.story.title : ""
      },
    },
    methods: {
      async deleteStory () {
        await this.$http.deleteData('/api/stories/' + this.modalProps.storyId)
        this.$dispatcher.emit("story.deleted", this.story)
        this.$refs.base.dismiss()
      },
    },
  }
</script>
