import fsp from 'node:fs/promises';
import { capitalize, objectKeys } from '@antfu/utils';
import { fileTypeFromStream } from 'file-type';
import Lucida from 'lucida';
import config from './config';
import type { Result } from './utils';

const lucida = new Lucida({
  modules: config.modules
});

if (config.login) lucida.login(config.login);

async function download(url: string): Promise<Result<string, string>> {
  const result = await lucida.getByUrl(url);
  if (result.type !== 'track')
    return {
      ok: false,
      error: 'Not a track'
    };
  if (!result.getStream)
    return {
      ok: false,
      error: 'Not a track with a stream'
    };

  const { stream, mimeType } = await result.getStream();

  const extension =
    // @ts-expect-error -- ReadableStream mismatches
    (await fileTypeFromStream(stream))?.ext ?? mimeType.split('/')[1];

  const file = await fsp.open(`${result.metadata.title}.${extension}`, 'w');

  const writable = file.createWriteStream();
  for await (const chunk of stream) writable.write(chunk);
  writable.end();

  return { ok: true, result: 'Downloaded!' };
}

// TODO: --- Use this to populate services list
export const enabledServices = objectKeys(config.modules).map((a) =>
  capitalize(a)
);

export { lucida, download };
