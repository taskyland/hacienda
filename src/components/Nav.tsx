import { A } from '@solidjs/router';
import type { Component } from 'solid-js';
import ModeToggle from './ModeToggle';
import { Button } from './kobalte/Button';

export const Nav: Component = () => {
  return (
    <nav class="top-0 right-0 h-14 px-4 sm:px-5 justify-center flex absolute bg-neutral-2/50 dark:bg-neutral-dark-2/50 border border-neutral-5 dark:border-neutral-dark-5 prose-a:no-underline prose-a:text-neutral-dark-1 dark:prose-a:text-neutral-5 w-full z-50">
      <div class="flex items-center w-full max-w-screen-2xl">
        <div class="flex items-center space-x-4 w-full pt-[1px]">
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
