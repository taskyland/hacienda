import type { Component } from 'solid-js';
import { Button } from './Button';
import ModeToggle from './ModeToggle';

export const Nav: Component = () => {
  return (
    <nav class="absolute top-0 right-0 z-50 flex h-14 w-full justify-center border border-neutral-5 bg-neutral-2/50 px-4 prose-a:text-neutral-dark-1 prose-a:no-underline sm:px-5 dark:border-neutral-dark-5 dark:bg-neutral-dark-2/50 dark:prose-a:text-neutral-5">
      <div class="flex w-full max-w-screen-2xl items-center">
        <div class="flex w-full items-center space-x-4 pt-[1px]">
          <div class="-mt-1">
            <A href="/" class="block">
              <img class="h-8 w-8" src="favicon.ico" alt="Logo" />
            </A>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <A href="https://github.com/taskyland/hacienda">
            <Button size="icon" aria="Open Github">
              <IconMdiGithub />
            </Button>
          </A>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
