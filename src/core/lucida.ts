import fsp from 'node:fs/promises';
import { capitalize, objectKeys } from '@antfu/utils';
import { consola } from 'consola';
import { fileTypeFromStream } from 'file-type';
import Lucida from 'lucida';
import type {
  EpisodeGetByUrlResponse,
  TrackGetByUrlResponse
} from 'lucida/types';
import pLimit from 'p-limit';
import { match } from 'ts-pattern';
import config from './config';
import { type Result, createDirectory } from './utils';

const lucida = new Lucida({
  modules: config.modules
});

if (config.login) lucida.login(config.login);
const concurrency = config.concurrency || 5;
const limit = pLimit(concurrency);

async function downloadTrack(
  track: TrackGetByUrlResponse | EpisodeGetByUrlResponse,
  paths: string[]
): Promise<Result<string, Error>> {
  try {
    const { stream, mimeType } = await track.getStream();

    const extension =
      // @ts-expect-error -- ReadableStream type mismatches
      (await fileTypeFromStream(stream))?.ext ?? mimeType.split('/')[1];

    const directory = await createDirectory(paths);

    await fsp.writeFile(
      `${directory}/${track.metadata.title}.${extension}`,
      stream
    );
    return { ok: true, result: `Downloaded ${track.metadata.title}` };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

async function download(
  url: string
): Promise<
  | Result<string, Error>
  | { ok: boolean; error: string; result?: undefined }
  | { ok: boolean; result: string; error?: undefined }
  | { ok: boolean; error: string }
  | undefined
> {
  const result = await lucida.getByUrl(url);

  return match(result)
    .with({ type: 'track' }, async (track) => {
      return await downloadTrack(track, [
        config.directory, // Configured directory
        track.metadata.artists[0].name, // Artist name
        track.metadata.title // Track name
      ]);
    })
    .with({ type: 'album' }, async (album) => {
      // There are multiple tracks in the album, so we need to download each one.
      // Make the album directory
      const directory = await createDirectory([
        config.directory, // Configured directory
        album.metadata.artists![0].name, // Artist name
        album.metadata.title // Album name
      ]);

      // Collect all the tracks
      const tracks: TrackGetByUrlResponse[] = [];

      for (const _track of album.tracks) {
        const track = await lucida.getByUrl(_track.url);
        if (track.type !== 'track' || !(await track.getStream())) return;
        tracks.push(track);
      }

      consola.debug(
        'Tracks',
        tracks.map((a) => a.metadata.title)
      );

      const downloadPromises = tracks.map(async (track) =>
        limit(() => downloadTrack(track, [directory]))
      );

      // Parallel download all tracks
      const results = await Promise.all(downloadPromises);
      const errors = results.filter((a) => !a.ok);

      if (errors.length) return { ok: false, error: errors[0].error.message };

      return {
        ok: true,
        result: `Downloaded ${tracks.length} tracks of ${album.metadata.title}.`
      };
    })
    .with(
      { type: 'podcast' },

      async (podcast) => {
        // Same as above
        // Make the album directory
        const directory = await createDirectory([
          config.directory, // Configured directory
          podcast.metadata.title // Podcast title
        ]);

        // Collect all the tracks
        const episodes: EpisodeGetByUrlResponse[] = [];

        for (const ep of podcast.episodes) {
          const episode = await lucida.getByUrl(ep.url);
          if (episode.type !== 'episode' || !(await episode.getStream()))
            return;
          episodes.push(episode);
        }

        consola.debug(
          'Episodes',
          episodes.map((a) => a.metadata.title)
        );

        const downloadPromises = episodes.map(async (episode) =>
          limit(() => downloadTrack(episode, [directory]))
        );

        // Parallel download all episodes
        const results = await Promise.all(downloadPromises);
        const errors = results.filter((a) => !a.ok);

        if (errors.length) return { ok: false, error: errors[0].error.message };

        return {
          ok: true,
          result: `Downloaded ${episodes.length} episodes of ${podcast.metadata.title}.`
        };
      }
    )
    .with({ type: 'episode' }, () => ({ ok: false, error: 'Not implemented' }))
    .with({ type: 'playlist' }, () => ({ ok: false, error: 'Not implemented' }))
    .with({ type: 'artist' }, () => ({ ok: false, error: 'Not implemented' }))
    .exhaustive();
}

// TODO: --- Use this to populate services list
export const enabledServices = objectKeys(config.modules).map((a) =>
  capitalize(a)
);

export { lucida, download };
