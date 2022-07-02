export default class PressureRegulator {

  constructor(dataChannel, opts) {
    this.dataChannel = dataChannel;
    this.opts = opts;
    this.setPressure();
  }

  setPressure() {
    this.dataChannel.bufferedAmountLowThreshold = this.opts.lowWatermark;
    this.dataChannel.onbufferedamountlow = this.onLowHandler.bind(this);
  }

  onLowHandler() {
    console.log('low watermark', this.dataChannel.bufferedAmount);
    if (this.resolve) this.resolve();
  }

  regulate() {
    const prom = new Promise(resolve => { this.resolve = resolve });
    if (this.dataChannel.bufferedAmount <= this.opts.highWatermark) {
      this.resolve();
    } else {
      console.log('high watermark', this.dataChannel.bufferedAmount);
    }
    

    return prom;
  }
}