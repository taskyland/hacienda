import * as ButtonPrimitive from '@kobalte/core/button'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '~/core/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-base transition duration-300 ease-in-out transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'dark:text-neutral-11 border border-neutral-6 bg-neutral-3 text-neutral-dark-11 outline-none hover:bg-neutral-4 focus-visible:ring-2 focus-visible:ring-neutral-8 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-1 active:bg-neutral-5 disabled:pointer-events-none disabled:border-neutral-5 disabled:bg-neutral-4 disabled:text-neutral-dark-8 disabled:opacity-90 dark:border-neutral-dark-6 dark:bg-neutral-dark-3 dark:hover:bg-neutral-dark-4 dark:focus-visible:ring-neutral-dark-6 dark:focus-visible:ring-offset-neutral-dark-1 dark:active:bg-neutral-dark-5 dark:disabled:border-neutral-dark-5 dark:disabled:bg-neutral-dark-4 dark:disabled:text-neutral-8'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

type ButtonProps = ButtonPrimitive.ButtonRootProps &
  VariantProps<typeof buttonVariants> & {
    class?: string
    aria: string
  }

export const Button = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, ButtonProps>
) => {
  const [local, rest] = splitProps(props as ButtonProps, [
    'class',
    'variant',
    'size',
    'aria'
  ])

  return (
    <ButtonPrimitive.Root
      aria-label={local.aria}
      class={cn(
        buttonVariants({
          size: local.size,
          variant: local.variant
        }),
        local.class
      )}
      {...rest}
    />
  )
}
