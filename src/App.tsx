/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { EdirProvider } from './context/EdirContext';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <EdirProvider>
        <AppShell />
      </EdirProvider>
    </ErrorBoundary>
  );
}
