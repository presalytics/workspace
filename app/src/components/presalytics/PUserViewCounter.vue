<template>
  <div>
    {{ viewCount }}
  </div>
</template>

<script>
  export default {
    props: {
      userId: {
        type: String,
        default: '',
      },
    },
    computed: {
      viewCount () {
        // TODO: remake as event query
        return 0
      },
    },
  }
</script>
