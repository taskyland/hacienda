import type { DropdownMenuTriggerProps } from '@kobalte/core/dropdown-menu'
import type { Component } from 'solid-js'
import { Button } from './Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './DropdownMenu'

export const ModeToggle: Component = () => {
  const [theme, setThemeState] = createSignal<'light' | 'dark' | 'system'>(
    'system'
  )

  createEffect(
    on(
      () => document.documentElement.classList.contains('dark'),
      (isDarkMode) => {
        setThemeState(isDarkMode ? 'dark' : 'light')
      }
    )
  )

  createEffect(
    on(
      () =>
        theme() === 'dark' ||
        (theme() === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches),
      (isDark) => {
        document.documentElement.classList[isDark ? 'add' : 'remove']('dark')
      }
    )
  )

  return (
    <DropdownMenu placement="bottom-end">
      <DropdownMenuTrigger
        as={(props: DropdownMenuTriggerProps) => (
          <Button aria="Toggle theme" size="icon" {...props}>
            <IconRadixIconsSun class="dark:-rotate-90 rotate-0 scale-100 transition-all dark:scale-0" />
            <IconRadixIconsMoon class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span class="sr-only">Toggle theme</span>
          </Button>
        )}
      />
      <DropdownMenuContent class="min-w-[8rem]">
        <DropdownMenuItem onSelect={() => setThemeState('light')}>
          <IconRadixIconsSun class="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setThemeState('dark')}>
          <IconRadixIconsMoon class="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setThemeState('system')}>
          <IconRadixIconsMobile class="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModeToggle
