import Deezer from 'lucida/streamers/deezer';
import { defineConfig } from './utils';

export default defineConfig({
  login: false,
  directory: '',
  modules: {
    deezer: new Deezer()
  }
});
