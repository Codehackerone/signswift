import { Button } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player/file";
import { ShrinkOutlined, ArrowsAltOutlined } from "@ant-design/icons";


const ShrinkExpandButton = (shrinked: boolean) => {
  if (shrinked) {
    return <ArrowsAltOutlined />;
  } else {
    return <ShrinkOutlined />;
  }
};

export default function LiveTranslation() {
  const [shrinked, setShrinked] = useState<boolean>(false);
  const [userVideo, setUserVideo] = useState<MediaStream | undefined>(
    undefined
  );
  const [videoFeedStyle, setVideoFeedStyle] = useState<Object>({
    width: "97%",
    minWidth: "80vw",
  });
  const handleShrinkExpand = () => {
    if (shrinked) {
      setVideoFeedStyle({
        width: "97%",
        minWidth: "80vw",
      });
    } else {
      setVideoFeedStyle({
        width: "65%",
        minWidth: "60vw",
      });
    }
    setShrinked(!shrinked);
  };
  const getUserWebcam = useCallback(async () => {
    try {
      const video = await navigator.mediaDevices.getUserMedia({ video: true });
      // console.log(video);
      setUserVideo(video);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    getUserWebcam();
  }, []);
  return (
    <div className="LiveTranslatorContainer">
      <div className="videoFeed d-flex justify-content-center align-items-center" style={videoFeedStyle}>
        <ReactPlayer
          url={userVideo}
          width={"100%"}
          height={"100%"}
          style={{ borderRadius: "10px" }}
          playing={true}
        ></ReactPlayer>
        <Button className="ShrinkExpandButton" onClick={handleShrinkExpand}>
          {ShrinkExpandButton(shrinked)}
        </Button>
      </div>
      <div className="languageFeed">
        
      </div>
    </div>
  );
}
