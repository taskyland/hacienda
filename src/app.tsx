import { FileRoutes } from '@solidjs/start/router';
import './app.scss';
import Nav from './components/Nav';

export default function App() {
  return (
    <Router
      root={(props) => (
        <main class="content">
          <Nav />
          <Suspense>{props.children}</Suspense>
          <hr />
          <footer class="w-full text-center text-neutral-dark-6 dark:text-neutral-6">
            <div>
              <p class="text-sm italic">
                Copyleft 2024. We are not affiliated with any of the services
                mentioned above.
              </p>
            </div>
          </footer>
        </main>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
