<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">

      <v-card>
        <v-card-title class="headline">
          Large File Transform Stream Demo
        </v-card-title>
        <v-card-text>
          <p>
            Select a large file (> 1 GB) to upload. This demo will stream the data through a transformer
            written in JavaScript and executed in the browser. This solution was born out of the need to modify
            binary data in the browser before it's uploaded to the server.
          </p>
          <a
            href="https://github.com/nuxt/nuxt.js"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>

        </v-card-text>
        <v-card-actions>
          <v-file-input
            ref="fileInput"
            chips
            label="Select a File"
            :disabled="$store.getters['uploader/inProgress']"
            @change="onSelectFile"
          ></v-file-input>
          
          <v-btn color="primary" class="ml-5" @click="onUploadFile"> 
            Upload
            <v-icon right dark>
              mdi-cloud-upload
            </v-icon> 
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'IndexPage',

  data: () => ({ file: null }),

  methods: {
    onSelectFile(file) {
      this.file = file;
    },

    onUploadFile() {
      if (this.file) {
        this.$store.dispatch('upload/upload', { file: this.file })
      }
    }
  }
}
</script>
