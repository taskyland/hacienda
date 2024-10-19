import type { JSX } from 'solid-js'

export const Loading = (): JSX.Element => (
  <div class="items-center text-white">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="size-4 animate-spin"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 6V3m4.25 4.75L18.4 5.6M18 12h3m-4.75 4.25l2.15 2.15M12 18v3m-4.25-4.75L5.6 18.4M6 12H3m4.75-4.25L5.6 5.6"
      />
      <title>Loading</title>
    </svg>
  </div>
)
