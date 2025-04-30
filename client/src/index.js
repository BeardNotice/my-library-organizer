import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import "./index.css";
import SessionProvider, { SessionContext } from './contexts/SessionProvider';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SessionProvider>
    <AppRoutes />
  </SessionProvider>
);
