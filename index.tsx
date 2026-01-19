
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("Shar App: React mounting initiated.");
  } catch (err) {
    console.error("Shar App: Initialization failed.", err);
    rootElement.innerHTML = `<div style="padding: 40px; color: red; text-align: center;">Initialization Error: ${err instanceof Error ? err.message : 'Check Console'}</div>`;
  }
} else {
  console.error("Shar App: Root container not found.");
}
