import { Injectable } from '@nestjs/common';
import * as DefaultRTCPeerConnection from 'wrtc';
const { RTCPeerConnection } = DefaultRTCPeerConnection;
import * as Stream from 'stream';
import { Buffer } from 'buffer';
import * as fs from 'fs';
import { defaultMaxListeners } from 'events';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Injectable()
export class WrtcConnections {
  private peers: Map<string, any>;
  constructor() {
    this.peers = new Map();
  }

  async handleOffer(connectionId, offer) {
    const peerConnection = await this.createPeerConnection(connectionId, offer);
    this.peers.set(connectionId, peerConnection);

    await this.createAnswer(peerConnection);
    return { answer: peerConnection.localDescription };
  }

  async createPeerConnection(connectionId, offer) {
    const peerConnection = new RTCPeerConnection({
      sdpSemantics: 'unified-plan',
    });

    await peerConnection.setRemoteDescription(offer);

    peerConnection.addEventListener('close', () => {
      this.peers.delete(connectionId);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'failed') {
        this.peers.delete(connectionId);
      }
    });

    peerConnection.addEventListener(
      'datachannel',
      this.onDataChannel.bind(this),
    );

    return peerConnection;
  }

  onDataChannel(event) {
    const dataChannel = event.channel;
    const docId = dataChannel.label;

    const readableStream = this.getReadable(dataChannel);
    const writableFile = fs.createWriteStream(`./uploads/${docId}`, {
      highWaterMark: 64000
    });
    console.log('mark is set at: ', writableFile.writableHighWaterMark)
    const dest = readableStream.pipe(writableFile);

    dest.on('error', () => dest.close);
    dest.on('close', () => dataChannel.close);
    dest.on('drain', () => { console.log('drain'); dataChannel.send('drain')})
    dest.on('finish', () => { 
      writableFile.end();
      dataChannel.close('drain');
    })
  }

  getReadable(dataChannel) {
    const readableStream = new Stream.Readable({
      read() {},
    });

    readableStream.on('pause', () => { console.log('pause'); dataChannel.send('pause') })

    dataChannel.addEventListener('message', (event) => {
      if (event.data === 'eof') return readableStream.emit('end');
      const buf = Buffer.from(event.data);
      readableStream.push(buf);
    });

    return readableStream;
  }

  async createAnswer(peer) {
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
  }
}
