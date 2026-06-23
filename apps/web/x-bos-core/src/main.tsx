import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installSafeRandomUuidPolyfill } from './lib/safeRandomUuid';
import './index.css';

installSafeRandomUuidPolyfill();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
