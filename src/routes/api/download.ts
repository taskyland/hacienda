import type { APIEvent } from '@solidjs/start/server'
import {
  url,
  flatten,
  nonEmpty,
  object,
  pipe,
  safeParseAsync,
  string
} from 'valibot'
import { createError, readValidatedBody } from 'vinxi/http'
import { download } from '~/core/lucida'

const bodySchema = object({
  url: pipe(string(), nonEmpty('Cannot be empty'), url('Invalid URL'))
})

export async function POST(event: APIEvent) {
  const target = await readValidatedBody(event.nativeEvent, (data) =>
    safeParseAsync(bodySchema, data)
  )

  if (!target.success)
    return json(
      { errors: flatten<typeof bodySchema>(target.issues) },
      { status: 400 }
    )

  const result = await download(target.output.url)
  if (!result.ok) return createError(result.error)

  return json(result)
}
