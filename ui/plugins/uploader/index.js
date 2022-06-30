import Uploader from './Uploader';

export default (context, inject) => {
  inject('uploader', (new Uploader()));
}