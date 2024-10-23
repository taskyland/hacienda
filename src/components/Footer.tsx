import type { Component } from 'solid-js'

export const Footer: Component = () => {
  return (
    <footer class="fixed bottom-0 left-0 w-full py-4 prose-a:no-underline">
      <div class="container mx-auto px-4">
        <div class="flex flex-col items-center justify-center space-y-2 text-center">
          <A href="https://github.com/taskyland" class="mx-auto">
            <span class="text-pink-11 dark:text-pink-dark-11">
              🌺 taskyland
            </span>{' '}
            community
          </A>
          <p class="text-neutral-11 text-sm dark:text-neutral-dark-11">
            Copyleft 2024. We are not affiliated with any of the services
            mentioned above.
          </p>
        </div>
      </div>
    </footer>
  )
}
