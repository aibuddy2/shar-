
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Shar App: index.tsx loaded");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("Shar App: React render called.");
  } catch (err) {
    console.error("Shar App: Initialization failed.", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; color: #ef4444; text-align: center; font-family: sans-serif;">
        <h3 style="margin-bottom: 8px;">Mounting Error</h3>
        <p style="font-size: 14px; color: #64748b;">${err instanceof Error ? err.message : 'Check Console'}</p>
      </div>
    `;
  }
} else {
  console.error("Shar App: Root container not found in DOM.");
}
