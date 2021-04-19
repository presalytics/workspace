<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
    max-width="600"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        Share A Story
      </v-toolbar>
      <v-card-text>
        <div class="text-h2 pa-12">
          This will be the share story dialog box for story: {{ storyId }}
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          text
          @click="closeDialog"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    computed: {
      dialog () {
        return this.$store.getters['stories/shareModal'].active || false
      },
      storyId () {
        return this.$store.getters['stories/shareModal'].storyId || null
      },
    },
    methods: {
      closeDialog () {
        this.$store.dispatch('stories/toggleShareModal', null)
      },
    },
  }
</script>
