export default class Connection {
  peerConnection;
  dataChannel;
  dataChannels = new Map();
  
  async createOffer(docId) {
    this.peerConnection = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
    this.createDataChannel(docId);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.peerConnection.onconnectionstatechange = () => {
      console.log('peer connection state change: ', this.peerConnection.connectionState);
    }

    return this.peerConnection.localDescription;
  }

  createDataChannel(label) {
    let dataChannel = this.getDataChannel(label);
    if (dataChannel) return dataChannel;

    dataChannel = this.peerConnection.createDataChannel(label);
    this.dataChannels.set(label, dataChannel);

    return new Promise((resolve, reject) => {
      dataChannel.addEventListener('open', () => {
        resolve(dataChannel);
        this.dataChannels.set(label, dataChannel);
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

  getDataChannel(label) {
    return this.dataChannels.get(label);
  }

  async handleAnswer(remoteDescription) {
    await this.peerConnection.setRemoteDescription(remoteDescription);
  }
}