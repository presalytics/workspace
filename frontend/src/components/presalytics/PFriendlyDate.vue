<template>
  <div>{{ friendlyDate }}</div>
</template>

<script>
  import moment from 'moment'

  moment.locale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: 'seconds',
      ss: '%ss',
      m: 'a minute',
      mm: '%dm',
      h: 'an hour',
      hh: '%dh',
      d: 'a day',
      dd: '%dd',
      M: 'a month',
      MM: '%d Mo.',
      y: 'a year',
      yy: '%d Yr.',
    },
  })

  export default {
    props: {
      timestamp: {
        type: String,
        default: '',
      },
    },
    computed: {
      friendlyDate () {
        var ts = this.$props.timestamp
        if (ts === '') {
          return '...'
        } else {
          return moment(ts).fromNow()
        }
      },
    },
  }
</script>
