import type { Component, JSX } from 'solid-js';

export const Input: Component<{
  id: string;
  placeholder: string;
  onInput: JSX.CustomEventHandlersCamelCase<HTMLInputElement>['onInput'];
}> = (props) => {
  return (
    <input
      class="flex h-10 w-full rounded-md bg-neutral-3 p-2 font-medium text-neutral-dark-5 text-sm shadow transition-[color,background-color,box-shadow] duration-300 ease-in-out placeholder:text-neutral-dark-11 hover:bg-neutral-4/90 focus:ring-1 focus:ring-neutral-5 focus-visible:outline-none focus-visible:ring-[1.5px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-dark-3 dark:text-neutral-5 dark:focus:ring-neutral-dark-5 dark:hover:bg-neutral-dark-4/90 dark:placeholder:text-neutral-11"
      placeholder={props.placeholder}
      id={props.id}
      onInput={props.onInput}
    />
  );
};
