import { Injectable } from '@nestjs/common';
import * as DefaultRTCPeerConnection from 'wrtc';
const { RTCPeerConnection } = DefaultRTCPeerConnection;
import * as Stream from 'stream';
import { Buffer } from 'buffer';
import * as fs from 'fs';

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
    console.log('on data channel', event.channel.label);
    const dataChannel = event.channel;
    const docId = dataChannel.label;

    const readableStream = this.getReadable(dataChannel);
    const writableFile = fs.createWriteStream(`./uploads/${docId}.png`);
    readableStream.pipe(writableFile);
  }

  getReadable(dataChannel) {
    const readableStream = new Stream.Readable({
      read() {},
    });

    dataChannel.addEventListener('message', (event) => {
      console.log(event.data);
      const buf = Buffer.from(event.data);
      readableStream.push(buf);
    });

    dataChannel.onclose = () => {
      console.log('close');
    };

    return readableStream;
  }

  async createAnswer(peer) {
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
  }
}
