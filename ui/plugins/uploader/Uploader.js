import Connection from './Connection';

export default class Uploader {
  constructor() {
    this.connections = new Map();
  }

  static uuid() {
    // An interestinig way to create a UUID. It doesn't require a lib
    const url = URL.createObjectURL(new Blob())
    return url.substring(url.lastIndexOf('/') + 1)
  }

  async negotiateConnection() {
    const connection = new Connection();
    const localDescription = await connection.createOffer();
    const docId = Uploader.uuid();
    this.connections.set(docId, connection);

    const resp = await fetch('/api/negotiate', {
      method: 'POST',
      body: JSON.stringify({ offer: localDescription, docId }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await resp.json();

    await connection.handleAnswer(data.answer);
    return docId;
  }

  async read(readable, docId) {
    const connection = this.connections.get(docId);
    await connection.dataChannel;

    const reader = readable.getReader();
    for (let result = await reader.read(); !result.done; result = await reader.read()) {
      this.sendChunk(connection.dataChannel, result.value);
    }

    console.log('close connection');
    connection.peerConnection.close();
  }

  sendChunk(channel, chunk) {
    console.log('processing chunk. length: ', chunk.length);
    const length = 8000;
    for (let start = 0; start <= chunk.length; start += length) {
      const data = chunk.slice(start, start + length);
      console.log('end index: ', start + length);
      console.log('slice length: ', data.length);
      channel.send(data);
    }
  }
}