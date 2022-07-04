<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">

      <v-card>
        <v-card-title class="headline">
          Large File Transform Stream Demo
        </v-card-title>
        <v-card-text>
          <p>
            Select a large file (> 2 GB) to upload. This demo will stream the data through a transformer
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
          <hr class="my-3" />

        </v-card-text>
        <v-card-actions>
       
         <!-- <v-btn color="primary" nuxt to="/inspire"> Continue </v-btn> -->
          <v-file-input
            chips
            label="Select a File"
            @change="onSelectFile"
          ></v-file-input>
          
          <v-btn color="primary" class="ml-5" > 
            Uplaod
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
  mounted() {
    // const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
  },
  methods: {
    onSelectFile(file) {
      if (file) {
        // const channel = await this.getChannel();
        this.$store.dispatch('upload/upload', { file })
       
      }
    },
    async getChannel() {
      const peerConnection = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
      const dataChannel = peerConnection.createDataChannel('stream-channel');

      const channelProm = new Promise((resolve, reject) => {

        dataChannel.addEventListener('open', event => {
          console.log('max size: ', peerConnection.sctp.maxMessageSize);
          console.log('stream-channel open');
        });
        dataChannel.addEventListener('close', event => {
          console.log('stream-channel close');
        });
        dataChannel.addEventListener('message', (message) => {
          console.log('message recieved: ', message.data);
        });
        dataChannel.addEventListener('error', (err) => {
          console.log(err);
          reject(err);
        });

        peerConnection.addEventListener('datachannel', (event) => {
          console.log('on dataChannel. lets send a ping');
          resolve(event.channel);
          // setInterval(() => {
          //   console.log('sending ping');
          //   event.channel.send('ping');
          // }, 1000);
        });
        peerConnection.addEventListener(
          'iceconnectionstatechange',
          (event) => console.log('ice connection state change', event),
        );
      });



      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      const resp = await fetch('/api/negotiate', {
        method: 'POST',
        body: JSON.stringify({ offer: peerConnection.localDescription }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await resp.json();
      console.log('answer: ', data);
      await peerConnection.setRemoteDescription(data.answer);

      return channelProm;
    }
  }
}
</script>
