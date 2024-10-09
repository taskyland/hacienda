'use server';

import type { APIEvent } from '@solidjs/start/server';
import { createError, getValidatedQuery } from 'vinxi/http';
import { z } from 'zod';
import { download } from '~/core/lucida';

const paramSchema = z.object({
  url: z.string().url()
});

export async function POST(event: APIEvent) {
  const target = await getValidatedQuery(
    event.nativeEvent,
    paramSchema.safeParseAsync
  );
  if (target.error) return createError(target.error.toString());

  const result = await download(target.data.url);
  if (!result.ok) return createError(result.error);

  return json(result);
}
