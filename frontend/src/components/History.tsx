import React, { useEffect, useState } from "react";
import "../componentsCss/HistoryCss.css";
import { Card } from "antd";
import axios from "axios";
import ReactPlayer from "react-player";
import { CopyOutlined } from "@ant-design/icons";

interface currentHistoryType {
  Heading: string;
  Url: string;
}
export default function History() {
  const [userVideoUrls, setUserVideoUrls] = useState<any[]>([]);
  const [currentHistory, setCurrentHistory] = useState<currentHistoryType>({
    Heading: "",
    Url: "",
  });
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8080/api/user/details",
        {
          headers: {
            "x-access-token": localStorage.getItem("currentuser"),
          },
        }
      );
      // console.log(response.data);
      setUserVideoUrls(response.data.videos);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);
  return (
    <div className="History">
      <div className="HistoryCards">
        {userVideoUrls.map((video) => {
          return (
            <Card
              hoverable
              size="small"
              key={video.url}
              style={{
                width: "97%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Play",
              }}
              onClick={() => {
                setCurrentHistory({
                  Heading: video.video_uri,
                  Url: video.url,
                });
              }}
            >
              <p style={{ margin: 0, fontSize: "1.2rem" }}>Heading</p>
              <p style={{ margin: 0 }}>
                {video.url.substring(0, 35) + ". . ."}
              </p>
            </Card>
          );
        })}
      </div>
      <div className="HistoryCardDetails">
        {currentHistory.Heading !== "" && (
          <h3 style={{ color: "white", fontFamily: "Play" }}>
            {/* <span>{currentHistory.Heading} | </span> */}
            <span style={{ marginRight: "3%" }}>
              {currentHistory.Url.substring(0, 75) + ". . ."}
            </span>
            <span
              className="copyToClipBoard"
              onClick={async () => {
                await window.navigator.clipboard.writeText(currentHistory.Url);
                  (document.getElementById("AfterCopyToClipBoard") as HTMLObjectElement).style.display = "block"
                  setTimeout(()=>{
                    document.getElementById("AfterCopyToClipBoard")!.style.display =
                    "none";
                  },1500);
              }}
            >
              <CopyOutlined />
              <div id="AfterCopyToClipBoard">Copied To Clip Board</div>
            </span>
          </h3>
        )}
        {currentHistory.Heading !== "" && (
          <div className="HistoryVideoContainer">
            <div className="HistoryVideoInnerContainer">
              <ReactPlayer
                url={currentHistory.Url}
                width={"100%"}
                height={"100%"}
                style={{ borderRadius: "10px" }}
                controls={true}
                playing={true}
              ></ReactPlayer>
            </div>
            <div className="HistoryTranslation"></div>
          </div>
        )}
      </div>
    </div>
  );
}
