import streamSaver from 'streamsaver'

export default ({ app }, inject) => {
  inject('streamSaver', streamSaver);
}