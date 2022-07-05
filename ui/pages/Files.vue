<template>
  <div>
    <v-row justify="center" align="center">
      <v-col class="text-center" cols="12" sm="10" md="6">
        <v-card>
          <v-list v-if="files.length" two-line>
            <v-list-item v-for="file in files" :key="file.uuid">
              <v-list-item-avatar>
                <v-icon class="blue" dark v-text="'mdi-clipboard-text'" />
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="file.name" />
                <v-list-item-subtitle v-text="file.size + ' bytes'" />
              </v-list-item-content>

              <v-list-item-action>
                <v-btn icon @click="downloadHandler(file)">
                  <v-icon color="grey lighten-1">mdi-download</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-card-text v-if="!files.length">
            You have no files.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'FilesPage',

  computed: {
    files() {
      return this.$store.getters['files/files'];
    }
  },

  mounted() {
    this.$store.dispatch('files/getFiles');
  },

  methods: {
    downloadHandler(file) {
      this.$store.dispatch('files/download', { file });
    }
  }
}
</script>
