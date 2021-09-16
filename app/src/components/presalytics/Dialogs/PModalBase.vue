<template>
  <v-dialog
    v-model="show"
    :fullscreen="isMobile"
    transition="dialog-bottom-transition"
    :max-width="maxWidth"
  >
    <v-card>
      <v-toolbar
        :color="color"
        dark
        flat
        dense
      >
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="dismiss"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <div class="pa-2">
        <template v-if="localModalProps">
          <slot>
            <v-card-text>Oops! You forgot to add a modal body</v-card-text>
          </slot>
        </template>
        <template v-else>
          <v-card-text
            color="error"
          >
            <strong>ERROR</strong>: If this is rendering, you forgot to define modalProps on your component.
          </v-card-text>
        </template>
        <v-card-actions>
          <slot name="actions" />
          <v-spacer />
          <v-btn
            :color="color"
            text
            @click="dismiss"
          >
            Close
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapMutations } from 'vuex'
  export default {
    model: {
      prop: 'modalProps',
      event: 'change',
    },
    props: {
      color: {
        type: String,
        default: () => 'primary',
      },
      maxWidth: {
        type: Number,
        default: () => 600,
      },
      name: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      modalProps: {
        type: Object,
        default: () => null,
      },
    },
    emits: ['change'],
    data: () => ({
      show: false,
    }),
    computed: {
      isMobile () {
        if (window.screen.width <= 760) {
          return true
        } else {
          return false
        }
      },
      localModalProps: {
        get () {
          return this.modalProps
        },
        set (newValue) {
          this.$emit('change', newValue)
        },
      },
    },
    created () {
      this.add({ name: this.name, show: false, properties: {} })
      this.unwatch = this.$store.watch((state, getters) => getters['dialogs/modal'](this.name), () => {
        var modal = this.$store.getters['dialogs/modal'](this.name)
        if (modal.show) {
          this.show = true
          this.localModalProps = modal.properties
        } else {
          this.show = false
          this.localModalProps = null
        }
      })
    },
    beforeUnmount () {
      this.unwatch()
    },
    methods: {
      ...mapMutations('dialogs', {
        add: 'ADD_MODAL',
        toggle: 'TOGGLE_MODAL',
      }),
      dismiss () {
        this.toggle({ name: this.name })
      },
    },
  }
</script>
