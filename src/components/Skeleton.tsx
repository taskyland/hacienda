import type { ComponentProps } from 'solid-js'
import { cn } from '~/core/utils'

export const Skeleton = (props: ComponentProps<'div'>) => {
  const [local, rest] = splitProps(props, ['class'])

  return (
    <div
      class={cn(
        'animate-pulse rounded-md bg-neutral-3 dark:bg-neutral-dark-3',
        local.class
      )}
      {...rest}
    />
  )
}
