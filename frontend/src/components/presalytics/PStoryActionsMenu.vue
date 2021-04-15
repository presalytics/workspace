<template>
  <v-menu
    :close-on-content-click="closeOnContentClick"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        color="success"
        dark
        v-bind="attrs"
        v-on="on"
      >
        Actions
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        class="menuItem"
      >
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  export default {
    props: {
      story: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      items: [
        { title: 'View Story' },
        { title: 'Share' },
        { title: 'Copy Story Id to Clipboard' },
        { title: 'See Story Events' },
        { title: 'Delete Story' },
      ],
      closeOnContentClick: true,
    }),
    methods: {
      handleMenuAction (actionName) {

      },
    },
  }
</script>

<style lang="sass" scoped>
  .listItem:hover
    background-color: gray
</style>
