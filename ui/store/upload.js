export const state = () => ({
  uploading: false
})

export const mutations = {
  setUploading: (state, { uploading }) => { state.uploading = uploading}
}

export const actions = {
    async upload(context, { file }) {
    const transformer = new window.TransformStream({
      start() {
        console.log('create prefix');
      },

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

    let docId;
    try {
      docId = await this.$uploader.openDataChannel(file.name);
    } catch(err) {
      console.log('Failed to establish rtc data-channel connection', err);
    }
    const readable = file.stream().pipeThrough(transformer);

    try {
      await this.$uploader.read(readable, { docId, sourceSize: file.size });
    } catch(err) {
      console.log('Something went wrong with readinig the stream. ', err);
    }
  }
}