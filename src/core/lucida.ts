import { spawn } from 'node:child_process'
import fsp from 'node:fs/promises'
import { Readable } from 'node:stream'
import { type ConsolaInstance, consola } from 'consola'
import { fileTypeFromStream } from 'file-type'
import Lucida from 'lucida'
import type {
  AlbumGetByUrlResponse,
  ArtistGetByUrlResponse,
  EpisodeGetByUrlResponse,
  PlaylistGetByUrlResponse,
  PodcastGetByUrlResponse,
  TrackGetByUrlResponse
} from 'lucida/types'
import mitt, { type Emitter } from 'mitt'
import pLimit, { type LimitFunction } from 'p-limit'
import { match } from 'ts-pattern'
import { type Config, loadConfig } from './config'
import { createDirectory } from './utils'

type Item = {
  title: string
  url: string
}

type Events = {
  server:
    | {
        status: 'connect'
        type:
          | 'track'
          | 'album'
          | 'podcast'
          | 'episode'
          | 'playlist'
          | 'artist'
          | (string & {})
        title: string
        author?: string
        cover: string
        items?: Item[]
      }
    | {
        status: 'disconnect'
        failed?: Item[]
      }
  // Track download events
  start: {
    title: string
    url: string
  }
  finish: {
    title: string
    url: string
    ok: boolean
  }
}

export class Downloader {
  public lucida!: Lucida
  public config!: Config
  public concurrency!: number
  public limit!: LimitFunction
  public logger: ConsolaInstance
  public emitter: Emitter<Events>

  public constructor() {
    this.logger = consola.withTag(this.constructor.name)
    this.emitter = mitt<Events>()
  }

  public async init() {
    try {
      this.config = await loadConfig()

      this.lucida = new Lucida({
        modules: this.config.modules,
        logins: this.config.logins
      })

      if (this.config.login) await this.lucida.login()

      this.concurrency = this.config.concurrency || 5
      this.limit = pLimit(this.concurrency)
    } catch (error) {
      this.logger.error(`Failed to initialize Lucida: ${error}`)
    }
  }

  public async downloadItem(
    track: TrackGetByUrlResponse | EpisodeGetByUrlResponse,
    paths: string[]
  ): Promise<{ ok: true } | { ok: false; title: string; url: string }> {
    try {
      this.emitter.emit('start', {
        title: track.metadata.title,
        url: track.metadata.url
      })

      const { stream, mimeType } = await track.getStream()

      const extension =
        // @ts-expect-error -- ReadableStream type mismatches
        (await fileTypeFromStream(stream))?.ext ?? mimeType.split('/')[1]

      const directory = await createDirectory(paths)

      await fsp.writeFile(
        `${directory}/${track.metadata.title}.${extension}`,
        stream
      )
      this.emitter.emit('finish', {
        title: track.metadata.title,
        url: track.metadata.url,
        ok: true
      })

      return { ok: true }
    } catch (_error) {
      const error = _error as Error
      this.emitter.emit('finish', {
        title: track.metadata.title,
        url: track.metadata.url,
        ok: false
      })

      this.logger.error(
        `Failed to download ${track.metadata.title}: ${track.metadata.url}`,
        error
      )

      return { ok: false, title: track.metadata.title, url: track.metadata.url }
    }
  }

  public async downloadMultiple(
    response:
      | AlbumGetByUrlResponse
      | PodcastGetByUrlResponse
      | PlaylistGetByUrlResponse
      | ArtistGetByUrlResponse
  ): Promise<{ ok: boolean; error: string } | undefined> {
    try {
      const metadata = match(response)
        .returnType<
          Omit<Extract<Events['server'], { status: 'connect' }>, 'status'>
        >()
        .with({ type: 'album' }, (a) => ({
          type: 'album',
          title: a.metadata.title,
          author: a.metadata.artists![0].name,
          cover: a.metadata.coverArtwork![0].url,
          items: a.tracks.map((item) => ({ title: item.title, url: item.url }))
        }))
        .with({ type: 'podcast' }, (a) => ({
          type: 'podcast',
          title: a.metadata.title,
          cover: a.metadata.coverArtwork![0].url,
          items: a.episodes.map((item) => ({
            title: item.title,
            url: item.url
          }))
        }))
        .with({ type: 'playlist' }, (a) => ({
          type: 'playlist',
          title: a.metadata.title,
          cover: a.metadata.coverArtwork![0].url,
          items: a.tracks.map((item) => ({ title: item.title, url: item.url }))
        }))
        .with({ type: 'artist' }, (a) => ({
          type: 'artist',
          title: a.metadata.name,
          cover: a.metadata.pictures![0],
          items:
            a.metadata.tracks?.map((item) => ({
              title: item.title,
              url: item.url
            })) ?? []
        }))
        .exhaustive()

      this.emitter.emit('server', {
        status: 'connect',
        ...metadata
      })

      const directory = await createDirectory([
        this.config.directory,
        metadata.author ?? '',
        metadata.title
      ])

      const items: (TrackGetByUrlResponse | EpisodeGetByUrlResponse)[] = []
      if (metadata.items?.length === 0) return { ok: false, error: 'No items' }

      for (const item of metadata.items!) {
        const track = await this.lucida.getByUrl(item.url)
        if (
          (track.type !== 'track' && track.type !== 'episode') ||
          !(await track.getStream())
        )
          continue
        items.push(track)
      }

      const downloadPromises = items.map(async (track) =>
        this.limit(() => this.downloadItem(track, [directory]))
      )

      const results = await Promise.all(downloadPromises)
      const failed = results
        .filter((a) => !a.ok)
        .filter((a) => a.url !== undefined && a.title !== undefined)
        .map((a) => ({
          title: a.title,
          url: a.url
        }))

      this.emitter.emit('server', {
        status: 'disconnect',
        failed
      })
    } catch (error) {
      this.logger.error('Failed to download multiple:\n', error)
    }
  }

  public async download(url: string): Promise<void> {
    try {
      const result = await this.lucida.getByUrl(url)

      await match(result)
        .with({ type: 'track' }, async (track) => {
          this.emitter.emit('server', {
            status: 'connect',
            type: 'track',
            title: track.metadata.title,
            cover: track.metadata.album!.coverArtwork![1].url,
            author: track.metadata.artists[0].name
          })
          const downloadResult = await this.downloadItem(track, [
            this.config.directory,
            track.metadata.artists[0].name,
            track.metadata.title
          ])

          if (downloadResult.ok)
            this.emitter.emit('server', {
              status: 'disconnect'
            })
          else
            this.emitter.emit('server', {
              status: 'disconnect',
              failed: [downloadResult]
            })
        })
        .with({ type: 'episode' }, async (episode) => {
          this.emitter.emit('server', {
            status: 'connect',
            type: 'episode',
            title: episode.metadata.title,
            cover: episode.metadata.podcast!.coverArtwork![1].url
          })
          const downloadResult = await this.downloadItem(episode, [
            this.config.directory,
            episode.metadata.podcast!.title,
            episode.metadata.title
          ])

          if (downloadResult.ok)
            this.emitter.emit('server', {
              status: 'disconnect'
            })
          else
            this.emitter.emit('server', {
              status: 'disconnect',
              failed: [downloadResult]
            })
        })
        .with({ type: 'album' }, async (album) => {
          return await this.downloadMultiple(album)
        })
        .with({ type: 'podcast' }, async (podcast) => {
          return await this.downloadMultiple(podcast)
        })

        .with({ type: 'playlist' }, async (playlist) => {
          return await this.downloadMultiple(playlist)
        })
        .with({ type: 'artist' }, async (artist) => {
          return await this.downloadMultiple(artist)
        })
        .exhaustive()
    } catch (error) {
      this.logger.error(error)
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  public async experimentalGetStream(
    track: TrackGetByUrlResponse | EpisodeGetByUrlResponse
  ) {
    if (track.type !== 'track') throw new Error('Not a track')
    if (!track.getStream) throw new Error('Track has no stream')
    const { stream, mimeType } = await track.getStream()

    const args = [
      '-hide_banner',
      '-loglevel',
      'error',
      '-thread_queue_size',
      '4096',
      // input:
      '-i',
      '-'
    ]

    const hasCover = track.metadata.album?.coverArtwork

    if (hasCover) {
      const bestCover = hasCover.sort((a, b) => b.width - a.width)[0]
      args.push('-i', bestCover.url)
    }

    const extension =
      // @ts-expect-error
      (await fileTypeFromStream(stream))?.ext ?? mimeType.split('/')[1]

    switch (extension) {
      case 'ogg':
        args.push('-c:a', 'copy', '-q:v', '10', '-preset', 'ultrafast')
        break
      case 'flac':
        args.push('-disposition:v', 'attached_pic')
        break
      default:
        args.push('-c:1', 'copy', '-b:a', '320k')
        break
    }

    args.push('-map', '0:a', '-map', '1:0', '-id3v2_version', '3')

    if (hasCover) {
      args.push(
        '-metadata:s:v',
        'title="Album cover"',
        '-metadata:s:v',
        'comment="Cover (front)"'
      )
    }

    if (track.metadata.artists?.[0]?.name) {
      args.push('-metadata', `artist="${track.metadata.artists[0].name}"`)
    }
    if (track.metadata.album?.title) {
      args.push('-metadata', `album="${track.metadata.album.title}"`)
    }
    if (track.metadata.album?.artists?.[0]?.name) {
      args.push(
        '-metadata',
        `album_artist="${track.metadata.album.artists[0].name}"`
      )
    }
    if (track.metadata.discNumber) {
      args.push('-metadata', `disc="${track.metadata.discNumber}"`)
    }
    if (track.metadata.trackNumber) {
      args.push('-metadata', `track="${track.metadata.trackNumber}"`)
    }
    if (track.metadata.title) {
      args.push('-metadata', `title="${track.metadata.title}"`)
    }
    if (track.metadata.album?.releaseDate) {
      const year = track.metadata.album.releaseDate.getFullYear()
      const month = track.metadata.album.releaseDate.getMonth() + 1
      const day = track.metadata.album.releaseDate.getDate()
      args.push(
        '-metadata',
        `date="${year.toString().padStart(4, '0')}-${month
          .toString()
          .padStart(2, '0')}-${day.toString().padStart(2, '0')}"`
      )
    }
    if (track.metadata.copyright) {
      args.push('-metadata', `copyright="${track.metadata.copyright}`)
    }
    if (track.metadata.composers?.[0]) {
      args.push('-metadata', `composer="${track.metadata.composers?.[0]}`)
    }
    if (track.metadata.producers) {
      args.push('-metadata', `producer="${track.metadata.producers?.[0]}`)
    }
    if (track.metadata.lyricists) {
      args.push('-metadata', `producer="${track.metadata.producers?.[0]}`)
    }
    if (track.metadata.explicit) args.push('-metadata', `rating="2"`)

    args.push('-f', extension)

    args.push('-')

    const ffmpeg = spawn('ffmpeg', args)

    ffmpeg.stderr.on('data', (_data) => {
      this.logger.debug(_data) // Don't care about its constant meandering
    })

    stream.pipe(ffmpeg.stdin)
    return {
      stream: Readable.toWeb(new Readable().wrap(ffmpeg.stdout)),
      extension
    }
  }
}

const downloader = new Downloader()
await downloader.init()
export { downloader }
