<template>
  <div
    class="d-flex flex-row"
    @click="handleContainerClick"
  >
    <div class="avatar-container">
      <v-avatar
        size="48px"
      >
        <img
          :src="$props.user.item.picture"
        >
      </v-avatar>
    </div>
    <div class="text-container">
      <v-spacer />
      <p class="body-1 user-text text-left">
        {{ $props.user.item.fullname }}
      </p>
      <slot name="caption">
        <p class="caption user-text">
          {{ $props.user.item.email }}
        </p>
      </slot>
      <v-spacer />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      user: {
        type: Object,
        default: () => ({
          given_name: null,
          family_name: null,
          id: null,
          picture: null,
          nickname: null,
        }),
      },
    },
    emits: ['click'],
    methods: {
      getFullName () {
        if (this.user.given_name && this.user.family_name) {
          return this.user.given_name + ' ' + this.user.family_name
        } else {
          return this.user.nickname
        }
      },
      handleContainerClick () {
        this.$emit('click')
      },
    },
  }
</script>

<style lang="sass" scoped>
  .avatar-container
    flex-basis: 50px
    flex-grow: 0
    align-items: center
    justify-content: center
    display: flex
    padding: 0.5rem 0 0.5rem 0
  .text-container
    flex-grow: 1
    align-items: flex-start
    justify-content: center
    display: flex
    margin-left: 1rem
    flex-direction: column
  .user-text
    margin: 0
</style>
