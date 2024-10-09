import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));

export type Result<T, E extends string | Error = Error> =
  | { ok: true; result: T }
  | { ok: false; error: E };
