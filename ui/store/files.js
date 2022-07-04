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
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}