import React, { useState } from "react";
import type { GetProps } from "antd";
import Icon from "@ant-design/icons";
import {
  UploadOutlined,
  HistoryOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Menu } from "antd";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import LiveTranslation from "./LiveTranslation";
import Login from "./Login";
import UploadVideo from "./UploadVideo";
import History from "./History";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

type CustomIconComponentProps = GetProps<typeof Icon>;
const Speech = () => (
  <svg
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M28.037 26.004c1.556-1.056 2.522-2.523 2.522-4.145 0-3.215-3.787-5.821-8.46-5.821s-8.46 2.606-8.46 5.821 3.788 5.821 8.46 5.821c1.138 0 2.223-0.155 3.214-0.435l4.276 3.192-1.551-4.432zM24.549 8.592c0-3.697-5.088-6.693-11.363-6.693s-11.363 2.997-11.363 6.693c0 1.739 1.126 3.323 2.972 4.513l-1.791 7.305 6.158-5.557c1.251 0.279 2.607 0.432 4.024 0.432 6.276 0 11.363-2.997 11.363-6.693z"></path>
  </svg>
);
const SpeechIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={Speech} {...props} />
);

const Language = () => (
  <svg
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 15H3.5A2.502 2.502 0 0 1 1 12.5v-9A2.502 2.502 0 0 1 3.5 1h9A2.502 2.502 0 0 1 15 3.5V8h-1V3.5A1.502 1.502 0 0 0 12.5 2h-9A1.502 1.502 0 0 0 2 3.5v9A1.502 1.502 0 0 0 3.5 14H8zm-.038-4.811a9.77 9.77 0 0 1-3.766 1.796l-.242-.97a8.816 8.816 0 0 0 3.282-1.532A9.264 9.264 0 0 1 4.888 5H4V4h3.279l-.544-.544.707-.707L8.692 4H12v1h-.914A9.836 9.836 0 0 1 9.78 8.152a3.853 3.853 0 0 0-1.82 2.037zm.032-1.383A8.167 8.167 0 0 0 10.058 5H5.922a8.18 8.18 0 0 0 2.072 3.806zM23 20.447v-8.894A2.525 2.525 0 0 0 20.484 9h-8.931A2.556 2.556 0 0 0 9 11.553v8.894A2.556 2.556 0 0 0 11.553 23h8.894A2.556 2.556 0 0 0 23 20.447zM20.484 10A1.517 1.517 0 0 1 22 11.516v8.968A1.517 1.517 0 0 1 20.484 22h-8.968A1.517 1.517 0 0 1 10 20.484v-8.968A1.517 1.517 0 0 1 11.516 10zm-2.086 8h-4.796l-1.159 2.23-.886-.46L16 11.215l4.443 8.555-.886.46zm-.52-1L16 13.385 14.122 17zM6 22.01a2.003 2.003 0 0 1-2-2v-2.303l1.646 1.646.707-.707L3.506 15.8.659 18.646l.707.707L3 17.72v2.292a3.003 3.003 0 0 0 3 3h2.058v-1zM22.646 4.647L21 6.293V4a3.003 3.003 0 0 0-3-3h-2v1h2a2.003 2.003 0 0 1 2 2v2.281l-1.634-1.635-.707.707 2.847 2.848 2.848-2.848z" />
    <path fill="none" d="M0 0h24v24H0z" />
  </svg>
);
const LanguageIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={Language}></Icon>
);

const English = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {/* <path fill="currentColor" d="M0 0h24v24H0z"/> */}
    <path fill="currentColor" d="M14 10h2v.757a4.5 4.5 0 0 1 7 3.743V20h-2v-5.5c0-1.43-1.175-2.5-2.5-2.5S16 13.07 16 14.5V20h-2V10zm-2-6v2H4v5h8v2H4v5h8v2H2V4h10z"/>
</svg>
);
const EnglishIcon = ()=>(
  <Icon component={English}></Icon>
);

const items: MenuItem[] = [
  getItem("Live Translation", "LiveTranslation", <SpeechIcon />),

  getItem("Upload Video", "UploadVideo", <UploadOutlined />),
  getItem("History", "History", <HistoryOutlined />),
  getItem("Select Language", "NoNavigate1", <LanguageIcon></LanguageIcon>, [
    getItem("English", "NoNavigate2", <EnglishIcon></EnglishIcon>),
  ]),
];

export default function LoggedInApp() {
  const [collapsedButton, setCollapsedButton] = useState(`CollapsedButton`);
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    if (collapsedButton === `CollapsedButton`) {
      setCollapsedButton(`CollapsedButton ButtonActive`);
    } else {
      setCollapsedButton(`CollapsedButton`);
    }
  };
  return (
    <div className="loggedInAppContainer">
      <div className="MiniMenu">
        {/* <div className="ExpaningButton"> */}
        <div onClick={toggleCollapsed} className={`${collapsedButton}`}>
          <BarsOutlined style={{ color: "white" }} />
        </div>
        {/* </div> */}
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={items}
          style={{ borderRadius: 10 }}
          onClick={({ key }) => {

            if (!key.startsWith("NoNavigate")) navigate(key);
          }}
        />
      </div>
      <div className="loggedinAppService">
        {/* <Outlet></Outlet> */}
        <Routes>
          <Route
            path="LiveTranslation"
            element={<LiveTranslation></LiveTranslation>}
          ></Route>
          <Route path="UploadVideo" element={<UploadVideo></UploadVideo>}></Route>
          <Route path="History" element={<History></History>}></Route>
        </Routes>
      </div>
    </div>
  );
}
