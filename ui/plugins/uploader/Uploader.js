import Connection from './Connection';
import PressureRegulator from './PressureRegulator';
import uploaderStoreModule from './storeModule';

export default class Uploader {
  constructor(store) {
    this.store = store;
    this.store.registerModule('uploader', uploaderStoreModule);
  }

  connection;

  static uuid() {
    // An interestinig way to create a UUID. It doesn't require a lib
    const url = URL.createObjectURL(new Blob())
    return url.substring(url.lastIndexOf('/') + 1)
  }

  async negotiateConnection(docId) {
    this.connection = new Connection();
    const localDescription = await this.connection.createOffer(docId);
    const connectionId = Uploader.uuid();

    const resp = await fetch('/api/negotiate', {
      method: 'POST',
      body: JSON.stringify({ offer: localDescription, connectionId }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!resp.ok) throw new Error('Failed to get offer from remote peer connection');

    const data = await resp.json();
    await this.connection.handleAnswer(data.answer);
  }

  async openDataChannel(fileName) {
    const docId = fileName + '_uuid_' + Uploader.uuid();
    await this.ensureConnection(docId);
    await this.connection.createDataChannel(docId);
    return docId;
  }

  ensureConnection(docId) {
    if (this.connection?.connectionState === 'connected') return;
    return this.negotiateConnection(docId);
  }

  async read(readable, { docId, sourceSize }) {
    this.store.dispatch('uploader/initStream', { docId, size: sourceSize })
    const trackProgress = this.getTracker(sourceSize);

    const dataChannel = await this.connection.getDataChannel(docId);
    const regulator = new PressureRegulator(dataChannel, {
      lowWatermark: 8000,
      highWatermark: 1e6
    })
    
    const msgLength = 16000;
    
    const reader = readable.getReader();
    for (let result = await reader.read(); !result.done; result = await reader.read()) {
      const chunk = result.value;
      for (let start = 0; start <= chunk.length; start += msgLength) {
        const data = chunk.slice(start, start + msgLength);
        dataChannel.send(data);
        trackProgress(data.length)
        await regulator.regulate();
      }
    }

    dataChannel.send('eof');
    setTimeout(() => this.store.dispatch('uploader/endOfFile'), 200);
  }

  sendChunk(channel, chunk, docId) {
    const length = 16000;
    for (let start = 0; start <= chunk.length; start += length) {
      const data = chunk.slice(start, start + length);
      channel.send(data);
    }
  }

  getTracker(sourceSize) {
    // only update UI on every 4% progress or so
    let trackerInterval = Math.floor(sourceSize / 25);
    let bytesSent = 0;

    return (count) => {
      bytesSent += count;
      trackerInterval -= count;
      if (trackerInterval <= 0) {
        this.store.dispatch('uploader/onProgress', { bytesSent });
        trackerInterval += Math.floor(sourceSize / 25);
      }
    }
  }
}