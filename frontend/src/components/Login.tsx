import React, { useContext, useEffect, useMemo } from "react";
import "../componentsCss/LoginCss.css";
import { useState } from "react";
import axios from "axios";
import LoginImg from "../ImageResources/login.png";
import EmailImg from "../ImageResources/email.png";
import UsernameImg from "../ImageResources/username.svg";
import PhonenumberImg from "../ImageResources/phone.svg";
import PasswordImg from "../ImageResources/password.svg";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, Modal } from "antd";
import { loginContext } from "../contexts/LoginProvider";

interface signUpFormDatatype {
  name: string | null;
  email: string | null;
  username: string | null;
  password: string | null;
  phoneNumber: string | null;
}

export default function Login() {
  const apiUrl = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const loggedin = useContext(loginContext);
  const [loginsign, setLoginSign] = useState("Sign Up");
  const [signUpFormData, setSignUpFormData] = useState<signUpFormDatatype>({
    name: "Name",
    email: "Email",
    username: "User Name",
    password: "Password",
    phoneNumber: "Phone Number",
  });
  const [signUpLogInForm, setSignUpLogInForm] = useState<signUpFormDatatype>({
    name: null,
    email: null,
    username: null,
    password: null,
    phoneNumber: null,
  });
  const [currentSignUp, setcurrentSignUp] = useState<string>("#314438"); //To be removed
  const [currentLogin, setcurrentLogin] = useState<string>("#efe7da"); //To be removed
  const [currentSignUpColor, setcurrentSignUpColor] = useState<string>("white"); //To be removed
  const [currentLoginColor, setcurrentLoginColor] = useState<string>("black"); //To be removed

  const toggleLogIn = () => {
    if (loginsign === "Login") {
      setLoginSign("Sign Up");
    } else {
      setLoginSign("Login");
    }
  };
  // Function to handle changes in form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpLogInForm({ ...signUpLogInForm, [e.target.name]: e.target.value });
  };

  // Function to handle Sign In
  const handleSignIn = async (e: React.FormEvent<HTMLButtonElement>) => {
    try {
      if (loginsign === "Sign Up") {
        const signInUser = await axios.post(
          apiUrl + "/api/user/register",
          signUpLogInForm
        );
        // console.log(signInUser.data);
        setLoginSign("Login");
        setIsModalOpen(true);
      } else {
        const logInUser = await axios.post(
          apiUrl + "/api/user/login",
          signUpLogInForm
        );
        // console.log(logInUser);
        localStorage.setItem("currentuser",logInUser.data.auth);
        loggedin.setloggedin(true);
        navigate("/user/LiveTranslation");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle Log In
  const handleLogIn = async () => {};

  // States and Function For Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#001529",
              titleColor: "#ffffff",
              colorText: "#ffffff",
              fontFamily:"Play"
            },
          },
        }}
      >
        <Modal open={isModalOpen} onOk={handleOk}>
          <p>User Registered Succesfully!! Please Login To Continue</p>
        </Modal>
      </ConfigProvider>
      <div className="outerLogin d-flex justify-content-center align-items-center flex-column">
        <div className="middleLogin d-flex flex-column justify-content-evenly align-items-center mb-3">
          <div className="loginHeading d-flex justify-content-center">
            {" "}
            <span>{loginsign}</span>
          </div>
          <div className="innerLogin d-flex flex-column justify-content-evenly align-items-center">
            {/* NAME INPUT FIELD */}
            {loginsign === "Sign Up" ? (
              <div className="nameInput inputfield d-flex justify-content-start align-items-center p-1">
                <img
                  className="nameImg"
                  src={LoginImg}
                  alt=""
                  style={{ height: "30px", width: "30px" }}
                />
                <input
                  name="name"
                  id="Name"
                  type="text"
                  placeholder={signUpFormData.name!}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <></>
            )}

            {/* EMAIL INPUT FIELD */}
            <div className="emailInput inputfield d-flex justify-content-start align-items-center p-1">
              <img
                className="nameImg"
                src={EmailImg}
                alt=""
                style={{ height: "30px", width: "30px" }}
              />
              <input
                name="email"
                type="email"
                id="Email"
                placeholder={signUpFormData.email!}
                onChange={handleChange}
              />
            </div>

            {/* USERNAME INPUT FIELD */}
            {loginsign === "Sign Up" ? (
              <div className="usernameInput inputfield d-flex justify-content-start align-items-center p-1">
                <img
                  className="nameImg"
                  src={UsernameImg}
                  alt=""
                  style={{ height: "30px", width: "30px" }}
                ></img>
                <input
                  name="username"
                  type="text"
                  id="User name"
                  placeholder={signUpFormData.username!}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <></>
            )}

            {/* PHONE NUMBER INPUT FIELD */}
            {loginsign === "Sign Up" ? (
              <div className="phoneNumberInput inputfield d-flex justify-content-start align-items-center p-1">
                <img
                  className="nameImg"
                  src={PhonenumberImg}
                  alt=""
                  style={{ height: "30px", width: "30px" }}
                ></img>
                <input
                  name="phoneNumber"
                  type="text"
                  id="Phone Number"
                  placeholder={signUpFormData.phoneNumber!}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <></>
            )}

            {/* PASSWORD INPUT FIELD */}
            <div className="passwordInput inputfield d-flex justify-content-start align-items-center p-1">
              <img
                className="nameImg"
                src={PasswordImg}
                alt=""
                style={{ height: "30px", width: "30px" }}
              />
              <input
                name="password"
                type="password"
                id="Password "
                placeholder={signUpFormData.password!}
                onChange={handleChange}
              />
              {loginsign !== "Sign Up" ? (
                <div className="forgotpassword">
                  Forgot Password?<a href="#">Click Here</a>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            className="submit"
            type="submit"
            onClick={handleSignIn}
          >
            {loginsign}
          </button>
        </div>

        {/* TRANSITION BUTTON TO LOGIN AND SIGNUP */}
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
    </>
  );
}
