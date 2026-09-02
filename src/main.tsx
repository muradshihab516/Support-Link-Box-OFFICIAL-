import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

(window as unknown as { __SUPPORT_LINK_BOX_MOUNTED__?: boolean }).__SUPPORT_LINK_BOX_MOUNTED__ = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
