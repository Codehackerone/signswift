import React from "react";
import "../componentsCss/LoginCss.css";
import { useState } from "react";
import LoginImg from "../ImageResources/login.png";

export default function Login() {
  const [loginsign, setLoginSign] = useState("Sign Up");
  const [currentSignUp, setcurrentSignUp] = useState("#314438");
  const [currentLogin, setcurrentLogin] = useState("#efe7da");
  const [currentSignUpColor, setcurrentSignUpColor] = useState("white");
  const [currentLoginColor, setcurrentLoginColor] = useState("black");

  const toggleLogIn = () => {
    if (loginsign === "Login") {
      setLoginSign("Sign Up");
    } else {
      setLoginSign("Login");
    }
  };
  return (
    <div className="outerLogin d-flex justify-content-center align-items-center flex-column">
      <div className="middleLogin d-flex flex-column justify-content-evenly align-items-center mb-3">
        <div className="loginHeading d-flex justify-content-center">
          {" "}
          <span>{loginsign}</span>
        </div>
        <form className="d-flex flex-column justify-content-evenly align-items-center" style={{width:"100%"}}>
          <div className="innerLogin d-flex flex-column justify-content-evenly align-items-center">
            <div className="nameInput inputfield d-flex justify-content-start align-items-center p-1">
              <img
                className="nameImg"
                src={LoginImg}
                alt=""
                style={{ height: "30px", width: "30px" }}
              />
              <input type="text" placeholder="Name" />
            </div>
            {loginsign === "Sign Up" ? (
              <div className="emailInput inputfield d-flex justify-content-start align-items-center p-1">
                <img
                  className="nameImg"
                  src={LoginImg}
                  alt=""
                  style={{ height: "30px", width: "30px" }}
                />
                <input type="email" placeholder="E-Mail" />
              </div>
            ) : (
              <></>
            )}
            <div className="passwordInput inputfield d-flex justify-content-start align-items-center p-1">
              <img
                className="nameImg"
                src={LoginImg}
                alt=""
                style={{ height: "30px", width: "30px" }}
              />
              <input type="password" placeholder="Password" />
              {loginsign !== "Sign Up" ? (
                <div className="forgotpassword">
                  Forgot Password?<a href="#">Click Here</a>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <button className="submit" type="submit">
            {loginsign}
          </button>
        </form>
      </div>
      <div className="transitionLoginToSignUp d-flex justify-content-between">
        <button
          className="transitionButton"
          onClick={() => setLoginSign("Sign Up")}
        >
          Sign Up
        </button>
        <button
          className="transitionButton"
          onClick={() => setLoginSign("Login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}
