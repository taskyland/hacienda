import { MetaProvider, Title } from '@solidjs/meta';
import { FileRoutes } from '@solidjs/start/router';
import './app.scss';
import Nav from './components/Nav';

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Hacienda</Title>
          <script
            innerHTML={`
   const getThemePreference = () => {
        if (
            typeof localStorage !== "undefined" &&
            localStorage.getItem("theme")
        ) {
            return localStorage.getItem("theme");
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    const setColorMode = () => {
        const isDark = getThemePreference() === "dark";
        document.documentElement.classList[isDark ? "add" : "remove"]("dark");
    };

    if (typeof localStorage !== "undefined") {
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
    }
  setColorMode()
`}
          />
          <main class="content">
            <Nav />
            <ErrorBoundary fallback={(error) => <div>Oops! {error}</div>}>
              <Suspense>{props.children}</Suspense>
            </ErrorBoundary>
            <hr />
            <footer class="prose-p mx-auto my-auto w-full max-w-xl prose-a:no-underline">
              <A href="https://github.com/taskyland" class="mx-auto">
                <span class="text-pink-11 dark:text-pink-dark-11">
                  💐 taskyland
                </span>{' '}
                community
              </A>
              <p>
                Copyleft 2024. We are not affiliated with any of the services
                mentioned above.
              </p>
            </footer>
          </main>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
