import NavBar from "./components/NavBar";
import React, { useEffect, useState } from "react";
import { Outlet, BrowserRouter, Routes, Switch, Route, Link } from "react-router-dom";


function App() {
  return (
    <>
      <header>
        <NavBar />
      </header>
      <main>
        <h1>My Library App</h1>
        <Outlet />
      </main>
    </>
  )
}

export default App;
