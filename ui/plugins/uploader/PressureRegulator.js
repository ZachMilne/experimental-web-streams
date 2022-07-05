export default class PressureRegulator {

  constructor(dataChannel, opts) {
    this.dataChannel = dataChannel;
    this.opts = opts;
    this.flowState = 'open';
    this.init();
  }

  init() {
    this.dataChannel.bufferedAmountLowThreshold = this.opts.lowWatermark;
    this.dataChannel.onbufferedamountlow = this.onLowHandler.bind(this);
    this.dataChannel.addEventListener('message', (event) => {
      if (event.data === 'pause') {
        this.flowState = 'paused';
      }
      if (event.data === 'drain') {
        this.flowState = 'open';
        if (this.isQueueUnderHighMark()) this.resolve();
      }
    })
  }

  isQueueUnderHighMark() {
    return this.dataChannel.bufferedAmount <= this.opts.highWatermark
  }

  onLowHandler() {
    if (this.resolve && this.flowState === 'open') {
      this.resolve();
    }
  }

  regulate() {
    const prom = new Promise(resolve => { this.resolve = resolve });
    if (this.isQueueUnderHighMark() && this.flowState === 'open') {
      this.resolve();
    }

    return prom;
  }
}