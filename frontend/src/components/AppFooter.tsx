import React from "react";
import { Layout } from "antd";

const { Footer } = Layout;

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "#001529",
  position: "absolute",
  left: "0vh",
  bottom: "0vh",
  width: "100%",
  height: "5vh",
  padding: "10px 0px 0px 0px",
  margin: "0px",
};

export default function AppFooter() {
  return (
    <div>
      <Footer style={footerStyle}>SignSwift. All Rights Reserved @ 2024</Footer>
    </div>
  );
}
