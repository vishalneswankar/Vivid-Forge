import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdProvider } from './contexts/AdContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AdProvider>
        <App />
      </AdProvider>
    </ThemeProvider>
  </React.StrictMode>
);