'use server'
import fsp from 'node:fs/promises'
import { capitalize, objectKeys } from '@antfu/utils'
import { consola } from 'consola'
import { fileTypeFromStream } from 'file-type'
import Lucida from 'lucida'
import type {
  AlbumGetByUrlResponse,
  ArtistGetByUrlResponse,
  Episode,
  EpisodeGetByUrlResponse,
  PlaylistGetByUrlResponse,
  PodcastGetByUrlResponse,
  Track,
  TrackGetByUrlResponse
} from 'lucida/types'
import pLimit from 'p-limit'
import { match } from 'ts-pattern'
import { loadConfig } from './config'
import { type Result, createDirectory } from './utils'

const config = await loadConfig()

const lucida = new Lucida({
  modules: config.modules,
  logins: config.logins
})

if (config.login) lucida.login()

export { lucida }

const concurrency = config.concurrency || 5
const limit = pLimit(concurrency)

export async function downloadItem(
  track: TrackGetByUrlResponse | EpisodeGetByUrlResponse,
  paths: string[]
): Promise<Result<string, string>> {
  try {
    const { stream, mimeType } = await track.getStream()

    const extension =
      // @ts-expect-error -- ReadableStream type mismatches
      (await fileTypeFromStream(stream))?.ext ?? mimeType.split('/')[1]

    const directory = await createDirectory(paths)

    await fsp.writeFile(
      `${directory}/${track.metadata.title}.${extension}`,
      stream
    )
    return { ok: true, result: `Downloaded ${track.metadata.title}` }
  } catch (error) {
    const _error = error as Error
    return { ok: false, error: _error.message }
  }
}

export async function downloadMultiple(
  response:
    | AlbumGetByUrlResponse
    | PodcastGetByUrlResponse
    | PlaylistGetByUrlResponse
    | ArtistGetByUrlResponse
): Promise<Result<string, string>> {
  // There are multiple tracks in the array, so we need to download each one.
  const metadata = match(response)
    .returnType<{ name: string; author: string; items: (Track | Episode)[] }>()
    .with({ type: 'album' }, (a) => ({
      name: a.metadata.title,
      author: a.metadata.artists![0].name,
      items: a.tracks
    }))
    .with({ type: 'podcast' }, (a) => ({
      name: a.metadata.title,
      author: '',
      items: a.episodes
    }))
    .with({ type: 'playlist' }, (a) => ({
      name: a.metadata.title,
      author: '',
      items: a.tracks
    }))
    .with({ type: 'artist' }, (a) => ({
      name: a.metadata.name,
      author: '',
      items: a.metadata.tracks ?? []
    }))
    .exhaustive()

  // Make the directory
  const directory = await createDirectory([
    config.directory, // Configured directory
    metadata.author, // Author name
    metadata.name // Response name
  ])

  // Collect all the tracks
  const items: (TrackGetByUrlResponse | EpisodeGetByUrlResponse)[] = []
  if (metadata.items.length === 0) return { ok: false, error: 'No items' }

  for (const item of metadata.items) {
    const track = await lucida.getByUrl(item.url)
    if (
      (track.type !== 'track' && track.type !== 'episode') ||
      !(await track.getStream())
    )
      continue
    items.push(track)
  }

  consola.debug(items.map((a) => a.metadata.title))

  const downloadPromises = items.map(async (track) =>
    limit(() => downloadItem(track, [directory]))
  )

  // Parallel download all tracks
  const results = await Promise.all(downloadPromises)
  const errors = results.filter((a) => !a.ok)

  if (errors.length) return { ok: false, error: errors[0].error }

  return {
    ok: true,
    result: `Downloaded ${items.length} tracks of ${metadata.name}.`
  }
}

export async function download(url: string): Promise<Result<string, string>> {
  const result = await lucida.getByUrl(url)

  return await match(result)
    .with({ type: 'track' }, async (track) => {
      return await downloadItem(track, [
        config.directory, // Configured directory
        track.metadata.artists[0].name, // Artist name
        track.metadata.title // Track name
      ])
    })
    .with({ type: 'album' }, async (album) => {
      return await downloadMultiple(album)
    })
    .with({ type: 'podcast' }, async (podcast) => {
      return await downloadMultiple(podcast)
    })
    .with({ type: 'episode' }, async (episode) => {
      return await downloadItem(episode, [
        config.directory, // Configured directory
        episode.metadata.podcast!.title, // Podcast title
        episode.metadata.title // Episode name
      ])
    })
    .with({ type: 'playlist' }, async (playlist) => {
      return await downloadMultiple(playlist)
    })
    .with({ type: 'artist' }, async (artist) => {
      return await downloadMultiple(artist)
    })
    .exhaustive()
}

// TODO: --- Use this to populate services list
export const enabledServices = objectKeys(config.modules).map((a) =>
  capitalize(a)
)
