<template>
  <p-modal-base
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
      <br>
      <span class="font-weight-thin text-body-2">
        Story Id: {{ storyId }}
      </span>
    </v-card-text>

    <template v-slot:actions>
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
  export default {
    components: {
      PModalBase: () => import('./PModalBase'),
    },
    props: {
      modalProps: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      title: 'Delete Story?',
      name: 'PStoryDeleteModal',
    }),
    computed: {
      story () {
        var vm = this
        if (this.storyId) {
          return vm.$store.getters['stories/story'](this.storyId)
        } else {
          return null
        }
      },
      storyTitle () {
        try {
          return this.story.title
        } catch {
          return ''
        }
      },
      storyId () {
        try {
          return this.$props.modalProps.storyId
        } catch {
          return null
        }
      },
    },
    methods: {
      deleteStory () {
        alert('TODO: write delete story method')
      },
    },
  }
</script>
