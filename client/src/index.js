import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import "./index.css";
import SessionProvider from './contexts/SessionProvider';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SessionProvider>
    <AppRoutes />
  </SessionProvider>
);
