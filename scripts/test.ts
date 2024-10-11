import { download } from '../src/core/lucida.ts';

await Promise.all([
  download(
    'https://www.qobuz.com/gb-en/album/a-rush-of-blood-to-the-head-coldplay/0190295933548'
  ),
  download('https://play.qobuz.com/track/63913000')
]);
