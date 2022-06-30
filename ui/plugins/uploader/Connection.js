export default class Connection {
  peerConnection;
  dataChannel;
  dataChannels = new Map();
  
  async createOffer() {
    const peerConnection = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
    this.createDataChannel(peerConnection);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    this.peerConnection = peerConnection;
    return peerConnection.localDescription;
  }

  createDataChannel(peer) {
    const dataChannel = peer.createDataChannel('from-ui');
    console.log('data channel id: ', dataChannel.id, dataChannel.label)
    dataChannel.addEventListener('message', (message) => {
      console.log('message receiived: ', message);
    })

    this.dataChannel = new Promise((resolve, reject) => {
      peer.addEventListener('datachannel', (event) => {
        console.log('on data channel: ', event)
        resolve(event.channel);
        console.log('data channel id: ', event.channel.id, event.channel.label)
        this.dataChannel = event.channel;
      });
      dataChannel.addEventListener('error', reject);
    })
  }

  createChannel(label) {
    const dataChannel = this.peerConnection.createDataChannel(label);
    this.dataChannels.set(label, dataChannel);

    return new Promise((resolve, reject) => {
      dataChannel.addEventListener('open', () => {
        console.log('ready state: ', dataChannel.readyState);
        resolve(dataChannel);
      });

      dataChannel.addEventListener('error', (event) => {
        console.log(`could not open data channel ${label}: `, event.error);
        dataChannel.close();
        this.dataChannels.delete(label);
        reject(event.error);
      });

      dataChannel.addEventListener('close', (event) => {
        console.log(`closed ${label}: `, event);
        this.dataChannels.delete(label);
      });
    });
  }

  async handleAnswer(remoteDescription) {
    await this.peerConnection.setRemoteDescription(remoteDescription);
  }
}