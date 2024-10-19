import fsp from 'node:fs/promises'
import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import { resolve } from 'pathe'
import { twMerge } from 'tailwind-merge'

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists))

export type Result<T, E extends string | Error = Error> =
  | { ok: true; result: T }
  | { ok: false; error: E }

export async function createDirectory(paths: string[]) {
  const directory = resolve(...paths)

  await fsp.mkdir(directory, {
    recursive: true
  })

  return directory
}
