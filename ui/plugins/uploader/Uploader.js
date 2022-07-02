import Connection from './Connection';

export default class Uploader {
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

  async openDataChannel() {
    const docId = Uploader.uuid();
    await this.ensureConnection(docId);
    await this.connection.createDataChannel(docId);
    return docId;
  }

  ensureConnection(docId) {
    if (this.connection?.connectionState === 'connected') return;
    return this.negotiateConnection(docId);
  }

  async read(readable, docId) {
    const dataChannel = await this.connection.getDataChannel(docId);

    const reader = readable.getReader();
    for (let result = await reader.read(); !result.done; result = await reader.read()) {
      this.sendChunk(dataChannel, result.value);
    }

    dataChannel.send('eof');
  }

  sendChunk(channel, chunk) {
    const length = 16000;
    for (let start = 0; start <= chunk.length; start += length) {
      const data = chunk.slice(start, start + length);
      channel.send(data);
    }
  }
}