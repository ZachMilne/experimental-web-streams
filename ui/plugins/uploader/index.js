import Uploader from './Uploader';

export default ({ app }, inject) => {
  inject('uploader', (new Uploader(app.store)));
}