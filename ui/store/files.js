export const state = () => ({
  files: []
})

export const getters = {
  files: (state) => state.files
}

export const mutations = {
  setFiles: (state, { files }) => { state.files = files}
}

export const actions = {
  async getFiles(context) {
    try {
      const response = await this.$axios.get('/api/files');
      context.commit('setFiles', { files: response.data })

    } catch(err) {
      console.log('could not fetch files: ', err);
    }
  },

  async download(context, { file }) {
    const params = new URLSearchParams({ docId: file.docId });
    const response = await fetch('/api/file?' + params)

    const transformer = new window.TransformStream({
      transform(chunk, controller) {
        /**
         * 
         * Transform logic goes here! 
         * 
         **/
        controller.enqueue(chunk)
      },
      flush(controller) {
        controller.terminate();
      }
    })

    const fileStream = this.$streamSaver.createWriteStream(file.name, {
      size: file.size
    })

    try {
      response.body.pipeThrough(transformer).pipeTo(fileStream)
    } catch(err) {
      console.log('error in download stream: ', err);
    }
    

  }
}