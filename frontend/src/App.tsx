import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AppFooter from "./components/AppFooter";
import AppContent from "./components/AppContent";
import LoginProvider, { loginContext } from "./contexts/LoginProvider";

function App() {
  const loggedin = useContext(loginContext);
  return (
    <>
      <LoginProvider>
        <div className="App">
          <Navbar></Navbar>
          <AppContent loggedin={loggedin.loggedin}></AppContent>
        </div>
        <AppFooter></AppFooter>
      </LoginProvider>
    </>
  );
}

export default App;
