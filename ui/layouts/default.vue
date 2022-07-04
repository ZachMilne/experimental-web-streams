<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    
    <v-footer :absolute="!fixed" app class="pl-0 pr-0">
      <v-progress-linear v-if="progress" :value="progress" class="mt-n2 upload-progress"></v-progress-linear>
      <span class="ml-4">&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: true,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-upload',
          title: 'Upload',
          to: '/',
        },
        {
          icon: 'mdi-file-multiple',
          title: 'Files',
          to: '/files',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'DEMO',
    }
  },

  computed: {
    progress() {
      return this.$store.getters['uploader/progress']
    }
  }
}
</script>
<style>
.upload-progress .v-progress-linear__background {
  background-color: #262626 !important;
}
</style>