import { Menu, MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useContext } from "react";
import LoginImg from "../ImageResources/login.png";
import { Link, useNavigate } from "react-router-dom";
import "../componentsCss/NavbarCss.css";
import { LogoutOutlined } from "@ant-design/icons";
import { loginContext } from "../contexts/LoginProvider";

const items: MenuProps["items"] = [
  {
    label: "Home",
    key: "/",
  },
  {
    label: "Meet The Team",
    key: "/team",
  },
  {
    label: "About The Project",
    key: "/about",
  },
];
export default function Navbar() {
  const navigate = useNavigate();
  const loggedin = useContext(loginContext);
  const handleLogOut = () => {
    localStorage.removeItem("currentuser");
    navigate("/logIn");
    loggedin.setloggedin(false);
  };
  return (
    <div
      className="Navbar"
      style={{ position: "absolute", top: "0px", left: "0px", width: "100%" }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: "Play, sans-serif",
        }}
      >
        <div
          className="logo"
          style={{ color: "white", marginRight: "10%", fontSize: "1.2rem" }}
        >
          <Link to={"/"} style={{ textDecoration: "none" }}>
            <span
              style={{
                color: "white",
                marginRight: "10%",
                fontSize: "1.2rem",
                textDecoration: "none",
              }}
            >
              SignSwift
            </span>
          </Link>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          items={items}
          style={{ flex: 1, minWidth: 0 }}
          onClick={({ key }) => {
            if (key === "/" && localStorage.getItem("currentuser") !== null) {
              navigate("/user/LiveTranslation");
            } else {
              navigate(key);
            }
          }}
        />

        <div className="login" style={{ color: "white" }}>
          {localStorage.getItem("currentuser") === null ? (
            <img
              src={LoginImg}
              alt=""
              style={{
                width: "30px",
                height: "30px",
                marginRight: "10px",
                filter: "invert(100%)",
              }}
            />
          ) : (
            <span
              className="logOut"
              style={{
                width: "30px",
                height: "30px",
                marginRight: "7px",
              }}
            >
              <LogoutOutlined />
            </span>
          )}
          {localStorage.getItem("currentuser") === null ? (
            <Link
              to={"/login"}
              style={{ textDecoration: "none", color: "white" }}
            >
              Login
            </Link>
          ) : (
            <span
              id="logout"
              style={{
                cursor: "pointer",
                textDecoration: "none",
                color: "white",
              }}
              onClick={handleLogOut}
            >
              LogOut
            </span>
          )}
        </div>
      </Header>
    </div>
  );
}
