import type { APIEvent } from '@solidjs/start/server';
import { createError } from 'vinxi/http';
import { lucida } from '~/core/lucida';

export async function POST(event: APIEvent) {
  const target = event.params.url;
  if (!target) throw createError('No URL provided');
  const result = await lucida.getByUrl(target);
  if (result.type !== 'track') throw createError('Not a track');
  if (!result.getStream) throw createError('Not a track with a stream');

  const { stream, mimeType } = await result.getStream();
  return new Response(stream, {
    headers: {
      'Content-Type': mimeType
    }
  });
}
