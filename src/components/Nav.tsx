import type { Component } from 'solid-js'
import { Button } from './Button'
import ModeToggle from './ModeToggle'

export const Nav: Component = () => {
  return (
    <header class="relative top-0 z-20 md:sticky">
      <nav class="mx-auto flex max-w-[700px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        <A href="/" class="mt-2">
          <img class="h-8 w-8" src="favicon.ico" alt="Logo" />
        </A>
        <div class="flex items-center justify-center gap-2">
          <A target="_blank" href="https://github.com/taskyland/hacienda">
            <Button size="icon" aria="Open Github">
              <IconMdiGithub />
            </Button>
          </A>
          <ModeToggle />
        </div>
      </nav>
    </header>
  )
}

export default Nav
