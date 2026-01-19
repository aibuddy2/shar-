
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const init = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("Failed to render React app:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error loading application. Please refresh.</div>`;
  }
};

// Ensure DOM is ready if automatic injection happens early
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
