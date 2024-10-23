import type { TrackGetByUrlResponse } from 'lucida/types'
import { Downloader } from '../src/core/lucida'

describe('Downloader', () => {
  let downloader: Downloader

  beforeEach(async () => {
    vi.clearAllMocks()
    downloader = new Downloader()
    await downloader.init()
  })

  it('should be able to download a track', async () => {
    const track = 'https://www.deezer.com/track/1856942647'

    const result = (await downloader.lucida.getByUrl(
      track
    )) as TrackGetByUrlResponse

    const emitSpy = vi.spyOn(downloader.emitter, 'emit')

    await downloader.downloadItem(result, ['tests', 'tmp'])
    expect(result).toBeTypeOf('object')
    expect(emitSpy).toHaveBeenCalledWith('start', {
      title: result.metadata.title,
      url: result.metadata.url
    })
  })
})
