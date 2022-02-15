<template>
  <div>
    {{ viewCount }}
  </div>
</template>

<script>
  export default {
    props: {
      story: {
        type: Object,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        default: () => {},
      },
    },
    computed: {
      viewCount () {
        // add new view count funtion
        return 0
      },
    },
    created () {
      // dispatch view count query
    },
  }
</script>
