<template>
  <div class="viewer-wrapper">
    <div class="viewer-row">
      <div class="viewer-screen-wrapper">
        <div class="viewer-screen-container">
          <screen
            :story-id="storyId"
          />
        </div>
      </div>
      <div class="comments-panel" />
    </div>
    <div class="toolbar-row">
      <div class="toolbar" />
    </div>
  </div>
</template>

<script>
  import Screen from './Screen.vue'
  export default {
    components: {
      Screen,
    },
    model: {
      prop: 'storyId',
      event: 'input',
    },
    props: {
      storyId: {
        type: String,
        default: '',
      },
      toolbar: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
    }),
    methods: {
      toggleToolbar () {
        this.emit('update:toolbar', this.toolbar)
      },
    },
  }
</script>

<style lang="sass" scoped>
  .viewer-wrapper
    display: flex
    flex-direction: column
    height: 100%
    width: 100%
    align-items: stretch
  .viewer-row
    flex-grow: 1
  .toolbar-row
    height: 0px
  .toolbar-row.active
    height: 75px !important
  .comments-panel
    width: 0px
  .comments-panel.active
    width: 133px !important
  .viewer-screen-wrapper
    height: 0
    overflow: hidden
    padding-bottom: 56.25%
    position: relative
  .viewer-screen-container
    position: absolute
    top: 0
    left: 0
    height: 100%
    width: 100%
</style>
