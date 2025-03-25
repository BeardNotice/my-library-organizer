import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookIndex from './pages/BookIndex'
import CreateLibrary from './components/CreateLibrary';
import NewBook from './pages/NewBook';
import ErrorPage from './pages/ErrorPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} errorElement={<ErrorPage />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="library">
            <Route path="new" element={<CreateLibrary />} />
          </Route>
          <Route path="books" element={<BookIndex />}>
            <Route path="new" element={<NewBook />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;