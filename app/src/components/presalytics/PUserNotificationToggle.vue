<template>
  <v-switch
    v-model="subscribe"
    :label="label"
    color="success"
    @change="handleSwitchChange"
  />
</template>

<script>
  export default {
    props: {
      userId: {
        type: String,
        default: '',
      },
    },
    data: () => ({
      subscribe: false,
    }),
    computed: {
      label () {
        if (this.subscribe) {
          return 'On'
        } else {
          return 'Off'
        }
      },
    },
    methods: {
      handleSwitchChange () {
        alert('Add API to turn on/off noticiations')
      },
    },
  }
</script>
