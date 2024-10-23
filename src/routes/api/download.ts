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
import { readValidatedBody } from 'vinxi/http'
import { downloader } from '~/core/lucida'
import { createEventStream } from '~/core/sse'

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

  const stream = createEventStream(event.nativeEvent)
  const errors = []

  downloader.emitter.on('*', async (type, data) => {
    await stream.push({
      event: type,
      data: JSON.stringify(data)
    })
  })

  downloader.emitter.on('error', (error) => errors.push(error))
  downloader.emitter.on('status', (data) => {
    if (data === 'disconnect') {
      stream.close()
    }
  })
  stream
    .push({ event: 'established', data: 'true' })
    .then(async () => await downloader.download(target.output.url))

  stream.onClosed(async () => {
    await stream.close()
  })
  return stream.send()
}
