
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const init = () => {
  console.log("Shar App: Initializing...");
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("Shar App: Root element not found");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("Shar App: Rendered successfully");
  } catch (error) {
    console.error("Shar App: Fatal render error:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h2 style="color: #ef4444;">Initialization Error</h2>
        <p style="color: #64748b;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 20px;">
          Try Again
        </button>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
