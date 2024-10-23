import { downloader } from '../src/core/lucida.ts'

downloader.emitter.on('*', (type, data) => console.info({ type, data }))

await Promise.all([
  downloader.download('https://www.deezer.com/track/1856942647')
  //   downloader.download(
  //     'https://www.qobuz.com/gb-en/album/a-rush-of-blood-to-the-head-coldplay/0190295933548'
  //   ),
  //   downloader.download('https://play.qobuz.com/track/63913000'),
  //   downloader.download(
  //     'https://www.qobuz.com/gb-en/album/bad-habits-eddie/w126zd3wjwvtb'
  //   )
])
