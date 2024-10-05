import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import './app.scss';

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>
            <main class="content">{props.children}</main>
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
