import React, { useState } from "react";
import "../componentsCss/UploadVideoCss.css";
import axios from "axios";
import ReactPlayer from "react-player";
import { UploadOutlined } from "@ant-design/icons";

export default function UploadVideo() {
  const [file, setFile] = useState<File | string>("");
  const [videoURL, setVideoURL] = useState<string | undefined>(undefined);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<boolean>(false); //To be Removed
  const [fileUploadStyle, setFileUploadStyle] = useState<{}>({});
  const [mouseOver, setMouseOver] = useState<boolean>(false);

  const handleUpload = async (e: React.MouseEvent<HTMLElement>) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8080/api/videos",
        formData,
        {
          headers: {
            "x-access-token": localStorage.getItem("currentuser"),
          },
        }
      );
      console.log(response.data);
      setVideoURL(response.data.url);
      setIsLoading(false);
      setUploaded(true);
      document
        .getElementsByClassName("UploadVideoButtonContainer")[0]
        .classList.add("SlidingAnimation");
      document
        .getElementsByClassName("AfterUploadButton")[0]
        .classList.toggle("Display-None");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data);
      } else {
        console.log(err);
      }
      setIsLoading(false);
    }
  };
  const handleUploadOutlined = async () => {
    setTimeout(() => {
      document
        .getElementById("AfterUploadSubmitButton")
        ?.classList.remove("AfterUploadSubmitButtonAnimation");
    }, 1000);
    const formData = new FormData();
    formData.append("file", file);
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8080/api/videos",
        formData,
        {
          headers: {
            "x-access-token": localStorage.getItem("currentuser"),
          },
        }
      );
      setVideoURL(response.data.url);
      setIsLoading(false);
      setUploaded(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data);
      } else {
        console.log(err);
      }
      setIsLoading(false);
    }
  };
  return (
    <div className="UploadVideoContainer">
      <div className="UploadedVideoInnerContainer">
        <div className="UploadVideoButtonContainer" style={fileUploadStyle}>
          <div className="FileInput">
            <input
              id="FileUpload"
              type="file"
              accept="video/*"
              onChange={async (e) => {
                setFile(e.target.files ? e.target.files[0] : "");
              }}
            />
            <label htmlFor="FileUpload" className="FileUploadLabel">
              <UploadOutlined
                style={{ fontSize: "1em", marginRight: "10px" }}
              />
              <span className="FileUploadText">Upload File</span>
            </label>
          </div>
          <button
            className="UploadSubmitButton"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </div>
        {uploaded && (
          <ReactPlayer
            url={videoURL}
            width={"100%"}
            height={"100%"}
            style={{ borderRadius: "10px" }}
            controls={true}
            playing={true}
          ></ReactPlayer>
        )}
        <button
          id="AfterUploadSubmitButton"
          onClick={() => {
            handleUploadOutlined();
          }}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
        <div className="AfterUploadButton">
          <input
            id="FileUpload"
            type="file"
            accept="video/*"
            onChange={async (e) => {
              setFile(e.target.files ? e.target.files[0] : "");
            }}
          />
          <label
            className="AfterUploadButtonLabelContainer"
            htmlFor="FileUpload"
            onClick={() => {
              console.log(loading);
              document
                .getElementById("AfterUploadSubmitButton")
                ?.classList.add("AfterUploadSubmitButtonAnimation");
            }}
            onMouseEnter={() => {
              setMouseOver(true);
            }}
            onMouseLeave={() => {
              setMouseOver(false);
            }}
          >
            <UploadOutlined style={{ fontSize: "1.5em" }} />
            {mouseOver && <span id="AfterUploadButtonLabel">Upload</span>}
          </label>
        </div>
      </div>
      <div className="VideoResult"></div>
    </div>
  );
}
