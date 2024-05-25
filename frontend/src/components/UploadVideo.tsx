import React, { useEffect, useState } from "react";
import "../componentsCss/UploadVideoCss.css";
import axios from "axios";
import ReactPlayer from "react-player";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";

export default function UploadVideo() {
  const [file, setFile] = useState<File | string>("");
  const [videoURL, setVideoURL] = useState<string | undefined>(undefined);
  const [processedVideoId, setProcessedVideoId] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<boolean>(false); //To be Removed
  const [processing, setProcessing] = useState<boolean>(false);
  const [afterProcessing, setAfterProcessing] = useState<boolean>(false);
  const [processVideoDetails, setProcessedVideoDetails] = useState<any[]>([]);
  const [videoSentenceTillNow, setVideoSentenceTillNow] = useState<string>("");
  const [videoFinalSentence, setVideoFinalSentence] = useState<string>("");
  const [newUpload, setNewUpload] = useState<boolean>(false);
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
      setVideoURL(response.data.url);
      setProcessedVideoId(response.data.videoId);
      setIsLoading(false);
      setUploaded(true);
      setAfterProcessing(true);
      setNewUpload(true);
      document
        .getElementsByClassName("UploadVideoButtonContainer")[0]
        .classList.add("SlidingAnimation");
      document
        .getElementsByClassName("AfterUploadButton")[0]
        .classList.toggle("Display-None");
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data);
      } else {
        console.log(err);
      }
      setIsLoading(false);
    }
  };
  const handleUploadOutlined = async () => {
    setVideoFinalSentence("");
    setVideoSentenceTillNow("");
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
      setNewUpload(true);
      setAfterProcessing(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data);
      } else {
        console.log(err);
      }
      setIsLoading(false);
    }
  };
  const handleProcessing = async () => {
    setProcessing(true);
    try {
      const response = await axios.get("http://127.0.0.1:8080/api/videos", {
        headers: {
          "x-access-token": localStorage.getItem("currentuser"),
        },
        params: { videoId: processedVideoId },
      });
      setVideoURL(response.data.video.processed_video_uri);
      // setVideoURL(
      //   "https://res.cloudinary.com/dw6db3mad/raw/upload/v1713127181/YuP6Zv6Aus.mp4"
      // );
      // setProcessing(false);
      // setUploaded(false);
      setProcessedVideoDetails(response.data.video.processed_data);
      // setProcessedVideoDetails([
      //   {
      //     word: "vacuum",
      //     probability: "0.037466682",
      //     current_duration: "1",
      //     sentence_till_now: "vacuum",
      //     llm_prediction: " I will vacuum the floor thoroughly.",
      //   },
      //   {
      //     word: "apple",
      //     probability: "0.03139153",
      //     current_duration: "2",
      //     sentence_till_now: "vacuum apple",
      //     llm_prediction:
      //       " I vacuum the apple. (This sentence does not make much sense in its given form, but using pronouns and adverbs to complete it, I came up with this",
      //   },
      //   {
      //     word: "green",
      //     probability: "0.58732307",
      //     current_duration: "3",
      //     sentence_till_now: "vacuum apple green",
      //     llm_prediction:
      //       " The vacuum cleaner is green and I will vacuum the apple.",
      //   },
      //   {
      //     word: "like",
      //     probability: "0.8441911",
      //     current_duration: "4",
      //     sentence_till_now: "vacuum apple green like",
      //     llm_prediction:
      //       " The vacuum cleaner sucks up the green apple like it's a large ball.",
      //   },
      //   {
      //     word: "snack",
      //     probability: "0.040575042",
      //     current_duration: "5",
      //     sentence_till_now: "vacuum apple green like snack",
      //     llm_prediction: " I like to vacuum with a green apple as a snack.",
      //   },
      // ]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let i = 0;
    try {
      const interval = setInterval(() => {
        setVideoSentenceTillNow(processVideoDetails[i].word);
        setTimeout(() => {
          setVideoSentenceTillNow(processVideoDetails[i++].sentence_till_now);
        }, 500);
        setVideoFinalSentence(processVideoDetails[i].llm_prediction);
      }, 1000);
      setTimeout(() => {
        clearInterval(interval);
        setProcessing(false);
        setAfterProcessing(false);
      }, processVideoDetails.length * 1000);
    } catch (error) {
      console.log(error);
    }
  }, [processVideoDetails]);
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
        {afterProcessing && (
          <>
            <button
              onClick={handleProcessing}
              className="StartProcessing"
              disabled={processing}
            >
              {processing && <LoadingOutlined />}
              <span className="StartProcessingText">
                {processing ? "Processing" : "Start Processing"}
              </span>
            </button>
          </>
        )}
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
              // console.log(loading);
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
      <div className="VideoResult">
        {videoSentenceTillNow !== "" && (
          <div className="VideoSentenceTillNow">
            Analysing video....  {videoSentenceTillNow}
            <span>{!afterProcessing && "("+processVideoDetails.length+"secs)"}</span>
          </div>
        )}
        {videoFinalSentence !== "" && (
          <div className="VideoFinalSentence">
            {afterProcessing ? "Finalising Text..." : "Final Text: -"}
            {videoFinalSentence}
          </div>
        )}
      </div>
    </div>
  );
}
