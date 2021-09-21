<template>
  <div>
    <v-snackbar
      :value="show"
      :color="type"
      :timeout="timeout"
      bottom
      multi-line
      @input="dismiss"
    >
      {{ message }}

      <template #action>
        <v-btn
          icon
          small
          outlined
          @click="dismiss"
        >
          <v-icon color="type">
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex'

  export default {
    data: () => ({
      show: false,
      message: '',
      type: null,
      timeout: -1,

    }),
    created () {
      this.unwatch = this.$store.watch((state) => state.alerts.message, () => {
        var message = this.$store.state.alerts.message
        if (message !== '') {
          this.message = message
          this.show = true
          this.type = this.$store.state.alerts.type
          this.timeout = this.$store.state.alerts.timeout
        } else {
          this.show = false
          this.message = ''
          this.type = null
          this.timout = -1
        }
      })
    },
    beforeDestroy () {
      this.unwatch()
    },
    methods: {
      ...mapMutations('alerts', {
        set: 'SET_ALERT',
        dismiss: 'DISMISS_ALERT',
      }),
    },
  }
</script>
