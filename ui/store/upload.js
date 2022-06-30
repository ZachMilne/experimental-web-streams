export const state = () => ({})

export const mutations = {}

export const actions = {
    async upload(context, { file }) {
    console.log('file size: ', file.size);
    let fileSize = file.size;
    const transformer = new window.TransformStream({

      start() {
        console.log('create prefix');
      },

      async transform(chunk, controller) {
        fileSize -= chunk.length;
        console.log('file size: ', fileSize);
        await wait(100).then(() =>  controller.enqueue(chunk))
      },

      flush(controller) {
        console.log('[flush]');
        controller.terminate();
      }
    })

    let docId;
    try {
      docId = await this.$uploader.negotiateConnection();
    } catch(err) {
      console.log('Failed to establish rtc stream-channel connection', err);
    }
    const readable = file.stream().pipeThrough(transformer);

    this.$uploader.read(readable, docId);

    


    // await fetch('http://localhost:3003/api/upload', {
    //   method: 'POST',
    //   body: stream, // transformer.readable
    //   mode: 'cors'
    // });

    // const data = await res.json();
    // console.log('data: ', data);

    // const reader = res.body.getReader();

    // for (let result = await reader.read(); !result.done; result = await reader.read()) {
    //   console.log('[value]', result.value);
    // }

  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}