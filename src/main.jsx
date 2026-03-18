import React from 'react'
import ReactDOM from 'react-dom/client'

// Global error handler to prevent blank screens
window.addEventListener('error', (e) => {
  console.error('App error:', e.error);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif"><h2>Something went wrong</h2><p style="color:#666;margin:12px 0">Please try refreshing the page.</p><p style="color:#999;font-size:12px">' + (e.error?.message || 'Unknown error') + '</p><button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;border:none;background:#C04E28;color:white;border-radius:10px;font-size:14px;cursor:pointer">Refresh</button></div>';
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

import('./App.jsx').then(({ default: App }) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((e) => {
  console.error('Failed to load app:', e);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif"><h2>Failed to load</h2><p style="color:#666;margin:12px 0">Please try refreshing.</p><p style="color:#999;font-size:12px">' + (e.message || '') + '</p><button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;border:none;background:#C04E28;color:white;border-radius:10px;font-size:14px;cursor:pointer">Refresh</button></div>';
  }
});
