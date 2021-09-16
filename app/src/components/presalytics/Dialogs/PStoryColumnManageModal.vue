<template>
  <p-modal-base
    v-model="modalProps"
    :name="name"
    color="primary"
    :title="title"
    @change="onModalStateChange"
  >
    <v-container
      fluid
    >
      <v-row>
        <v-col
          cols="12"
        >
          <h4>
            Manage Story Table Settings
          </h4>
          <p class="subtitle-1 pt-2">
            Select Columns to Display on Stories Table
          </p>
          <v-select
            v-model="selectedColumns"
            :items="allColumnNames"
            label="Select"
            multiple
            chips
            hint="Select displayed columns"
            persistent-hint
            @input="onSelectedColumnChange"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
        >
          <p class="subtitle-1">
            Activity Measurement Timeframe
          </p>
          <v-btn-toggle
            v-model="timeWindow"
            color="warning"
            mandatory
            borderless
            tile
            @change="onTimeWindowChange"
          >
            <v-btn
              text
              value="year"
            >
              Year
            </v-btn>
            <v-btn
              text
              value="month"
            >
              Month
            </v-btn>
            <v-btn
              value="week"
              text
            >
              Week
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-container>
  </p-modal-base>
</template>

<script>
  import { mapMutations } from 'vuex'
  export default {
    components: {
      PModalBase: () => import('./PModalBase'),
    },
    data: () => ({
      title: 'Manage Columns',
      name: 'PStoryManageColumnsModal',
      modalProps: {},
      selectedColumns: [],
      timeWindow: 0,
    }),
    computed: {
      allColumnNames () {
        var vm = this
        return vm.$store.getters['stories/table'].columns.map((cur) => cur.text)
      },
    },
    methods: {
      ...mapMutations('stories', {
        toggleColumn: 'TOGGLE_TABLE_COLUMN',
        updateTimeWindow: 'UPDATE_TABLE_WINDOW',
      }),
      onModalStateChange () {
        var vm = this
        this.selectedColumns = vm.$store.getters['stories/table'].columns.filter((cur) => cur.show).map((cur) => cur.text)
        this.onTimeWindowChange()
      },
      onSelectedColumnChange () {
        var vm = this
        var currentColumns = vm.$store.getters['stories/table'].columns.filter((cur) => cur.show).map((cur) => cur.text)
        var diff = this.arrayDiff(currentColumns, this.selectedColumns)
        var toggleColumns = vm.$store.getters['stories/table'].columns.filter((cur) => diff.includes(cur.text))
        toggleColumns.forEach((cur) => {
          this.toggleColumn({ value: cur.value })
        })
      },
      arrayDiff (arr1, arr2) {
        return arr1.filter(x => !arr2.includes(x)).concat(arr2.filter(x => !arr1.includes(x)))
      },
      onTimeWindowChange () {
        this.updateTimeWindow({ timeWindow: this.timeWindow })
      },
    },
  }
</script>
