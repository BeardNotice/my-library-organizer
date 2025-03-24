import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookIndex from './pages/BookIndex'
//import LibraryDashboard from './pages/LibraryDashboard';
import CreateLibrary from './pages/CreateLibrary';
//import BookDetail from './pages/BookDetail';
import NewBook from './pages/NewBook';
//import EditBook from './pages/EditBook';
//import Profile from './pages/Profile';
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
            {/* <Route index element={<LibraryDashboard />} /> */}
            <Route path="new" element={<CreateLibrary />} />
          </Route>
          <Route path="books" element={<BookIndex />}>
            <Route path="new" element={<NewBook />} />
            {/* <Route path=":bookId" element={<BookDetail />} /> */}
            {/* <Route path=":bookId/edit" element={<EditBook />} /> */}
          </Route>
          {/* <Route path="profile" element={<Profile />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;