<template>
  <div class="d-flex rootContainer">
    <div class="pictureContainer">
      <div
        class="positionWrapper"
        :class="getSpacingClass(collaboratorCount)"
      >
        <div
          v-for="(item, index) in truncatedCollaborators"
          :key="item.id"
          :class="getPictureClass(index)"
        >
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-avatar>
                <img
                  :src="getPictureUrl(item)"
                  class="images"
                  max-height="40px"
                  v-bind="attrs"
                  v-on="on"
                >
              </v-avatar>
            </template>
            <span>{{ getUserName(item) }}</span>
          </v-tooltip>
        </div>
      </div>
    </div>
    <div class="countContainer d-flex justify-center align-center">
      <div class="countItem">
        ( {{ collaboratorCount }} )
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      story: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    computed: {
      collaborators () {
        var c = this.$props.story.item.collaborators.slice()
        return c
      },
      truncatedCollaborators () {
        var c = this.$props.story.item.collaborators.slice()
        if (c.length > 3) {
          c = c.filter( (cur) => {
            this.getUserId(cur.id) !== this.$store.getters.userId
          })
        }
        return c.slice(0, 3)
      },
      collaboratorCount () {
        return this.$props.story.item.collaborators.slice().length
      },
    },
    methods: {
      getPictureClass (index) {
        return 'pictureItem-' + index
      },
      getPictureUrl (collaborator) {
        var url = null
        var userId = this.getUserId(collaborator)
        var usr = this.$store.getters['users/getUser'](userId)
        if (usr) {
          url = usr.picture
        }
        return url
      },
      getSpacingClass (cnt) {
        var ret = 'noSpace'
        switch (cnt) {
          case 1: {
            ret = 'margin-1'
            break
          }
          case 2: {
            ret = 'margin-2'
            break
          }
        }
        return ret
      },
      getUserName(collaborator) {
        var userId = this.getUserId(collaborator)
        return this.$store.getters['users/getFriendlyName'](userId)
      },
      getUserId(collaborator) {
        return this.$store.state.stories.collaborators[collaborator].userId
      }
    },
  }
</script>

<style lang="sass" scoped>
  .pictureContainer
    flex-grow: 1
    flex-basis: auto
    min-width: 75px
    width: 75px
    display: flex
    flex-direction: column
    justify-content: center
  .countContainer
    flex-basis: auto
    min-width: 40px
  .rootContainer
    min-height: 60px !important
  .pictureItem-0
    position: absolute
    top: 0
    left: 0
    z-index: 4
    transform: translateY(-50%)
  .pictureItem-1
    position: absolute
    top: 0
    left: 15px
    z-index: 3
    transform: translateY(-50%)
  .pictureItem-2
    position: absolute
    top:0
    left: 30px
    z-index: 2
    transform: translateY(-50%)
  .countItem
    white-space: nowrap
    padding-left: 10px
  .positionWrapper
    height: 0
    width: 100%
    position: relative
  .margin-1
    margin-left: 15px
  .margin-2
    margin-left: 7px
  .images
    background-color: white
</style>
