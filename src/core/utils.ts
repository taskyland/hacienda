import fsp from 'node:fs/promises';
import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import type Deezer from 'lucida/streamers/deezer';
import type Qobuz from 'lucida/streamers/qobuz';
import type Spotify from 'lucida/streamers/spotify';
import type Tidal from 'lucida/streamers/tidal';
import { resolve } from 'pathe';
import { twMerge } from 'tailwind-merge';

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

export type Result<T, E extends string | Error = Error> =
  | { ok: true; result: T }
  | { ok: false; error: E };

export async function createDirectory(paths: string[]) {
  const directory = resolve(...paths);

  await fsp.mkdir(directory, {
    recursive: true
  });

  return directory;
}

export interface Config {
  /** Some modules require a login */
  login?: boolean;
  /** Directory to download to */
  directory: string;
  /** Concurrency limit */
  concurrency?: number;
  /** Modules to use */
  modules: Partial<{
    deezer: Deezer;
    tidal: Tidal;
    qobuz: Qobuz;
    spotify: Spotify;
  }>;
  /** Login credentials */
  logins?: {};
}

export function defineConfig(config: Config) {
  return config;
}
