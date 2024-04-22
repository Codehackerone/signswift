import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AppFooter from "./components/AppFooter";
import AppContent from "./components/AppContent";

function App() {
  const [loggedin, setloggedin] = useState(true);
  return (
    <>
      <div className="App">
        <Navbar></Navbar>
        <AppContent loggedin={loggedin}></AppContent>
      </div>
      <AppFooter></AppFooter>
    </>
  );
}

export default App;
