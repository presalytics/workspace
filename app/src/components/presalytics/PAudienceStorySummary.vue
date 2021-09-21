<template>
  <div class="story-links-container">
    <v-spacer />
    <template v-if="hasStories">
      <v-hover
        v-slot="{ hover }"
      >
        <router-link
          :to="recentStoryRoute"
          class="recent-story-link"
          :class="{ 'on-hover': hover }"
        >
          {{ recentStoryTitle }}
        </router-link>
      </v-hover>
    </template>
    <template v-if="hasMultipleSharedStories">
      <v-hover
        v-slot="{ hover}"
      >
        <router-link
          :to="filteredStoriesRoute"
          class="filtered-stories-link"
          :class="{ 'on-hover': hover }"
        >
          View All
        </router-link>
      </v-hover>
    </template>
    <v-spacer />
  </div>
</template>

<script>
  export default {
    props: {
      user: {
        type: Object,
        default: () => ({
          id: '',
        }),
      },
    },
    computed: {
      recentStoryTitle () {
        return this.mostRecentStory.title
      },
      stories () {
        var vm = this
        return vm.$store.getters['stories/storiesByUser'](this.userId)
      },
      filteredStoriesRoute () {
        return {
          name: 'Stories',
          query: {
            userId: this.userId,
          },
        }
      },
      hasMultipleSharedStories () {
        return this.stories.length > 1
      },
      recentStoryRoute () {
        return {
          name: 'Story View',
          params: {
            storyId: this.mostRecentStory.id,
          },
        }
      },
      mostRecentStory () {
        var vm = this
        return vm.stories.reduce((acc, cur) => {
          var accDate = new Date(acc.updated_at)
          var curDate = new Date(cur.updated_at)
          if (curDate > accDate) {
            acc = cur
          }
          return acc
        }, this.stories[0])
      },
      hasStories () {
        return this.stories.length > 0
      },
      userId () {
        return this.$props.user.app_metadata.api_user_id
      },
    },
  }
</script>

<style lang="sass" scoped>
  .story-links-container
    display: flex
    flex-direction: column
  .recent-story-link
    flex-grow: 0
    margin: 0
    color: rgba(0, 0, 0, 0.87)
    font-size: 1rem
    text-decoration: none
    max-width: 200px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
  .filtered-stories-link
    flex-grow: 0
    margin: 0
    color: rgba(0, 0, 0, 0.87)
    font-size: .875rem
    text-decoration: none
  .on-hover
    text-decoration: underline

</style>
