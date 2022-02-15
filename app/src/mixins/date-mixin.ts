import Vue from 'vue'

/* eslint-disable no-unused-vars */
export const enum TimeWindows {
  Month = "month",
  Year = "year",
  Week = "week"
}
/* eslint-enable no-unused-vars */

export default Vue.extend({
  data() {
    return {
      timeWindow: TimeWindows.Week
    }
  },
  methods: {
    getDaysArray(startDate: string | Date, endDate: string | Date) : Array<Date> {
      if (typeof startDate === 'string') startDate = new Date(startDate)
      if (isNaN(startDate.getTime())) {
        throw new Error('Argument "startDate" is not of type "Date"')
      }
      if (typeof endDate === 'string') endDate = new Date(endDate)
      if (isNaN(endDate.getTime())) {
        throw new Error('Argument "endDate" is not of type "Date"')
      }
      const dt = startDate
      const arr = []
      while (dt <= endDate) { // eslint-disable-line no-unmodified-loop-condition
        arr.push(new Date(dt))
        dt.setDate(dt.getDate() + 1)
      }
      return arr
    },
    aYearAgo(): Date {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)
      return date
    },
    aMonthAgo(): Date {
      const date = new Date()
      date.setMonth(date.getMonth() - 1)
      return date
    },  
    aWeekAgo(): Date {
      const date = new Date()
      date.setDate(date.getDate() - 7)
      return date
    },
    datesAreOnSameDay(first: Date, second: Date): boolean {
      return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate()
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
    countByDay(dataList: Array<unknown>, date: Date, getElementDateCallback: (element: any) => Date): number {
      return dataList.filter((cur) => {
        const eventDate = getElementDateCallback(cur)
        return this.datesAreOnSameDay(date, eventDate)
      }).length
    },
    getTimeWindowFn(): () => Date {
      let fn: () => Date
      switch (this.timeWindow) {
        case (TimeWindows.Week): {
          fn = this.aWeekAgo
          break
        }
        case (TimeWindows.Month): {
          fn = this.aMonthAgo
          break
        }
        case (TimeWindows.Year): {
          fn = this.aYearAgo
          break
        }
        default: {
          throw new Error(`"${this.timeWindow}" is not a valid time window for the DateMixin`)
        }
      }
      return fn
    },  
  }
})