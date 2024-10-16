import * as ButtonPrimitive from '@kobalte/core/button'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '~/core/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition duration-300 ease-in-out transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-3 hover:bg-neutral-4/90 focus:ring-2 focus:ring-neutral-5 dark:bg-neutral-dark-3 dark:hover:bg-neutral-dark-4/90 dark:focus:ring-neutral-dark-5 shadow',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9'
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
