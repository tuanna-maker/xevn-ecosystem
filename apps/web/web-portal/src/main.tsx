import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { applyUiDensity } from './config/uiDensity';
import { installSafeRandomUuidPolyfill } from './lib/safeRandomUuid';
import './index.css';

installSafeRandomUuidPolyfill();
applyUiDensity();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
