'use server';

import type { APIEvent } from '@solidjs/start/server';
import {
  url,
  flatten,
  nonEmpty,
  object,
  pipe,
  safeParseAsync,
  string
} from 'valibot';
import { createError, getValidatedQuery } from 'vinxi/http';
import { download } from '~/core/lucida';

const paramSchema = object({
  url: pipe(string(), nonEmpty('Cannot be empty'), url('Invalid URL'))
});

export async function POST(event: APIEvent) {
  const target = await getValidatedQuery(event.nativeEvent, (data) =>
    safeParseAsync(paramSchema, data)
  );
  if (!target.success)
    return json(
      { errors: flatten<typeof paramSchema>(target.issues) },
      { status: 400 }
    );

  const result = await download(target.output.url);
  if (!result.ok) return createError(result.error);

  return json(result);
}
