import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type {
  TextFieldDescriptionProps,
  TextFieldErrorMessageProps,
  TextFieldInputProps,
  TextFieldLabelProps,
  TextFieldRootProps
} from '@kobalte/core/text-field'
import { TextField as TextFieldPrimitive } from '@kobalte/core/text-field'
import { cva } from 'class-variance-authority'
import type { ValidComponent, VoidProps } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '~/core/utils'

type TextFieldProps<T extends ValidComponent = 'div'> =
  TextFieldRootProps<T> & {
    class?: string
  }

export const TextFieldRoot = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldProps<T>>
) => {
  const [local, rest] = splitProps(props as TextFieldProps, ['class'])

  return <TextFieldPrimitive class={cn('space-y-1', local.class)} {...rest} />
}

export const textfieldLabel = cva(
  'text-sm data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70 font-medium',
  {
    variants: {
      label: {
        true: 'data-[invalid]:text-destructive'
      },
      error: {
        true: 'text-destructive text-xs'
      },
      description: {
        true: 'font-normal text-neutral-dark-11 dark:text-neutral-dark-11'
      }
    },
    defaultVariants: {
      label: true
    }
  }
)

type _TextFieldLabelProps<T extends ValidComponent = 'label'> =
  TextFieldLabelProps<T> & {
    class?: string
  }

export const TextFieldLabel = <T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, _TextFieldLabelProps<T>>
) => {
  const [local, rest] = splitProps(props as _TextFieldLabelProps, ['class'])

  return (
    <TextFieldPrimitive.Label
      class={cn(textfieldLabel(), local.class)}
      {...rest}
    />
  )
}

type _TextFieldErrorMessageProps<T extends ValidComponent = 'div'> =
  TextFieldErrorMessageProps<T> & {
    class?: string
  }

export const TextFieldErrorMessage = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, _TextFieldErrorMessageProps<T>>
) => {
  const [local, rest] = splitProps(props as _TextFieldErrorMessageProps, [
    'class'
  ])

  return (
    <TextFieldPrimitive.ErrorMessage
      class={cn(textfieldLabel({ error: true }), local.class)}
      {...rest}
    />
  )
}

type _TextFieldDescriptionProps<T extends ValidComponent = 'div'> =
  TextFieldDescriptionProps<T> & {
    class?: string
  }

export const TextFieldDescription = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, _TextFieldDescriptionProps<T>>
) => {
  const [local, rest] = splitProps(props as _TextFieldDescriptionProps, [
    'class'
  ])

  return (
    <TextFieldPrimitive.Description
      class={cn(
        textfieldLabel({ description: true, label: false }),
        local.class
      )}
      {...rest}
    />
  )
}

type _TextFieldInputProps<T extends ValidComponent = 'input'> = VoidProps<
  TextFieldInputProps<T> & {
    class?: string
  }
>

export const TextField = <T extends ValidComponent = 'input'>(
  props: PolymorphicProps<T, _TextFieldInputProps<T>>
) => {
  const [local, rest] = splitProps(props as _TextFieldInputProps, ['class'])

  return (
    <TextFieldPrimitive.Input
      class={cn(
        'flex h-10 w-full rounded-md bg-neutral-3 p-2 font-medium text-neutral-dark-5 text-sm shadow transition-[color,background-color,box-shadow] duration-300 ease-in-out placeholder:text-neutral-dark-11 hover:bg-neutral-4/90 focus:ring-1 focus:ring-neutral-5 focus-visible:outline-none focus-visible:ring-[1.5px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-dark-3 dark:text-neutral-5 dark:focus:ring-neutral-dark-5 dark:hover:bg-neutral-dark-4/90 dark:placeholder:text-neutral-11',
        local.class
      )}
      {...rest}
    />
  )
}
