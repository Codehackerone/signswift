import { Button } from "antd";
import React, { useCallback, useState } from "react";
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
  const [loading, setLoading] = useState(false);
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
      setUserVideo(video);
    } catch (error) {
      console.log(error);
    }
  }, []);
  const handleVideoCapture = async () => {
    document.getElementsByClassName("VideoCaptureStart")[0].textContent =
      "Loading ...";
    await getUserWebcam();
    setTimeout(()=>{
      setLoading(true);
    },1200);
  };
  const handleClose = async ()=>{
    userVideo?.getTracks().forEach((track)=>{
      track.stop();
    });
    setLoading(false);
  }
  return (
    <div className="LiveTranslatorContainer">
      <div
        className="videoFeed d-flex justify-content-center align-items-center"
        style={videoFeedStyle}
      >
        {!loading && (
          <button className="VideoCaptureStart" onClick={handleVideoCapture}>
            Start Capturing
          </button>
        )}
        {loading && (
          <ReactPlayer
            url={userVideo}
            width={"100%"}
            height={"100%"}
            style={{ borderRadius: "10px" }}
            playing={true}
          ></ReactPlayer>
        )}
        <Button className="ShrinkExpandButton" onClick={handleShrinkExpand}>
          {ShrinkExpandButton(shrinked)}
        </Button>
        {loading && <button className="VideoCaptureClose" onClick={handleClose}>Close</button>}
      </div>
      <div className="languageFeed"></div>
    </div>
  );
}
