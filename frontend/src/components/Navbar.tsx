import { Menu, MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import React from "react";
import LoginImg from "../ImageResources/login.png";
import { Link, useNavigate } from "react-router-dom";
import "../componentsCss/NavbarCss.css";
import { ConfigProvider } from "antd";

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
        {/* <ConfigProvider theme={{
          components:{
            Menu:{
              colorSuccess : "white"
            }
          }
        }}> */}
        <Menu
          theme="dark"
          mode="horizontal"
          // defaultSelectedKeys={["2"]}
          items={items}
          style={{ flex: 1, minWidth: 0 }}
          onClick={({ key }) => {
            navigate(key);
          }}
        />
        {/* </ConfigProvider> */}
        <div className="login" style={{ color: "white" }}>
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
          <Link to={"/login"} style={{textDecoration:"none", color:"white"}}>Login</Link>
        </div>
      </Header>
    </div>
  );
}
