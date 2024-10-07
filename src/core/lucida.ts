import Lucida from 'lucida';
import config from './config';

const lucida = new Lucida({
  modules: config.modules
});

if (config.login) lucida.login(config.login);

export { lucida };
