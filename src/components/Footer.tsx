import type { Component } from 'solid-js'

export const Footer: Component = () => {
  return (
    <footer class="prose-p mx-auto my-auto w-full max-w-xl prose-a:no-underline">
      <A href="https://github.com/taskyland" class="mx-auto">
        <span class="text-pink-11 dark:text-pink-dark-11">💐 taskyland</span>{' '}
        community
      </A>
      <p>
        Copyleft 2024. We are not affiliated with any of the services mentioned
        above.
      </p>
    </footer>
  )
}
