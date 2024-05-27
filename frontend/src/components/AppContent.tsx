import React, { useContext } from "react";
import "../componentsCss/AppContentCss.css";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Team from "./Team";
import LandingPageCarousel from "./LandingPageCarousel";
import Login from "./Login";
import LoggedInApp from "./LoggedInApp";
import { loginContext } from "../contexts/LoginProvider";

export default function AppContent(props: any) {
  return (
    <div
      className="AppContent"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <div
        className="innerContent"
        style={{ overflow: "hidden", overflowY: "scroll" }}
      >
        <Routes>
          <Route
            path="/"
            element={<LandingPageCarousel></LandingPageCarousel>}
          ></Route>
          <Route path="/team" element={<Team></Team>}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route
            path="/user/*"
            element={
              <div className="LoggedInApp">
                <LoggedInApp></LoggedInApp>
              </div>
            }
          ></Route>
        </Routes>
      </div>
    </div>
  );
}
