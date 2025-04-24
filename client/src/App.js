import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import './App.css';
import React from "react";

function App() {

  return (
  <>
          <header>
            <NavBar />
          </header>
          <main>
            <Outlet />
          </main>
  </>
  );
}

export default App;

//test comment
