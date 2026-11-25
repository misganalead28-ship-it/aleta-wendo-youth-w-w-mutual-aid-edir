/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { EdirProvider } from './context/EdirContext';
import { AppShell } from './components/AppShell';

export default function App() {
  return (
    <EdirProvider>
      <AppShell />
    </EdirProvider>
  );
}
