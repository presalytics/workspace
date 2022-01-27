<template>
  <v-sparkline
    :value="value"
    :gradient="gradient"
    :smooth="radius || false"
    :padding="padding"
    :line-width="width"
    :stroke-linecap="lineCap"
    :gradient-direction="gradientDirection"
    :fill="fill"
    :type="type"
    :auto-line-width="autoLineWidth"
    auto-draw
  />
</template>

<script>
  const gradients = [
    ['#222'],
    ['#42b3f4'],
    ['red', 'orange', 'yellow'],
    ['purple', 'violet'],
    ['#00c6ff', '#F0F', '#FF0'],
    ['#f72047', '#ffd200', '#c1c1c1'],
  ]

  var getDaysArray = function (start, end) {
    var dt = new Date(start)
    var arr = []
    while (dt <= end) { // eslint-disable-line no-unmodified-loop-condition
      arr.push(new Date(dt))
      dt.setDate(dt.getDate() + 1)
    }
    return arr
  }

  var aYearAgo = () => {
    var date = new Date()
    date.setFullYear(date.getFullYear() - 1)
    return date
  }

  var aMonthAgo = () => {
    var date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date
  }

  var aWeekAgo = () => {
    var date = new Date()
    date.setDate(date.getDate() - 7)
    return date
  }

  var datesAreOnSameDay = (first, second) => {
    return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate()
  }

  var countByDay = (eventList, date) => {
    return eventList.filter((cur) => {
      var eventDate = new Date(cur.time)
      return datesAreOnSameDay(date, eventDate)
    }).length
  }

  export default {
    props: {
      story: {
        type: Object,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        default: () => {},
      },
    },
    data: () => ({
      width: 8,
      radius: 25,
      padding: 8,
      lineCap: 'round',
      gradient: gradients[5],
      gradientDirection: 'top',
      gradients,
      fill: false,
      type: 'trend',
      autoLineWidth: false,
    }),
    computed: {
      value () {
        var storyId = this.$props.story.item.id
        var evts = this.$store.getters['apiEvents/getStoryEvents'](storyId)
        var dates = getDaysArray(this.timeSpanFn(), new Date())
        return dates.map((cur) => countByDay(evts, cur))
      },
      timeWindow () {
        return this.$store.getters['stories/table'].timeWindow
      },
      timeSpanFn () {
        var fn
        switch (this.timeWindow) {
          case ('week'): {
            fn = aWeekAgo
            break
          }
          case ('month'): {
            fn = aMonthAgo
            break
          }
          case ('year'): {
            fn = aYearAgo
            break
          }
        }
        if (!fn) {
          fn = aMonthAgo
        }
        return fn
      },
    },
  }
</script>
