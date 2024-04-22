import React, { useState } from "react";
import "../componentsCss/AppContentCss.css";
import { Flex } from "antd";
import { Route, Routes } from "react-router-dom";
import Team from "./Team";
import LandingPageCarousel from "./LandingPageCarousel";
import Login from "./Login";
import LoggedInApp from "./LoggedInApp";
import LiveTranslation from "./LiveTranslation";
import UploadVideo from "./UploadVideo";
import History from "./History";

export default function AppContent(props: any) {
  // const [loggedin, setloggedin] = useState(false);
  if (!props.loggedin) {
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
  } else {
    return (
      <div className="LoggedInApp">
        <Routes>
          <Route path="/user/*" element={<LoggedInApp></LoggedInApp>}>
            <Route path="LiveTranslation" element={<LiveTranslation></LiveTranslation>}></Route>
            <Route path="UploadVideo" element={<UploadVideo></UploadVideo>}></Route>
            <Route path="History" element={<History></History>}></Route>
          </Route>
        </Routes>
        {/* <LoggedInApp></LoggedInApp> */}
      </div>
      // <Routes>
      //   <Route
      //     path="/loggedin/*"
      //     element={
      //       <div className="LoggedInApp">
      //         <LoggedInApp></LoggedInApp>
      //       </div>
      //     }
      //   ></Route>
      //   <Route
      //     path="/login"
      //     element={
      //       <div
      //         style={{
      //           height: "81vh",
      //           width:"95vw",
      //           position:"absolute",
      //           top:"11vh",
      //           left:"2.4vw",
      //           borderRadius:"20px"
      //         }}
      //       >
      //         <Login></Login>
      //       </div>
      //     }
      //   ></Route>
      // </Routes>
    );
  }
}
