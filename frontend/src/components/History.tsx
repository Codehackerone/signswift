import React, { useEffect, useState, useRef } from "react";
import "../componentsCss/HistoryCss.css";
import { Card, Select } from "antd";
import axios from "axios";
import ReactPlayer from "react-player";
import { CopyOutlined } from "@ant-design/icons";
import { stringify } from "querystring";

interface currentHistoryType {
  Heading: string;
  Url: string;
  ProcessedData: any[];
}
export default function History() {
  const apiUrl = process.env.REACT_APP_BACKEND_URL;
  const [userVideoUrls, setUserVideoUrls] = useState<any[]>([]);
  const [translateWord , settranslateWord] = useState<string>("");
  const [currentHistory, setCurrentHistory] = useState<currentHistoryType>({
    Heading: "",
    Url: "",
    ProcessedData: [],
  });
  const [TranslatedHistorySentence, setTranslatedHistorySentence] =
    useState<string>("");
  const [TranslatedHistoryLLm, setTranslatedHistoryLLm] = useState<string>("");
  const playerRef = useRef(null);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(apiUrl + "/api/user/details", {
        headers: {
          "x-access-token": localStorage.getItem("currentuser"),
        },
      });
      setUserVideoUrls(response.data.data.videos);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleChange = (value: string) => {
    settranslateWord(value);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentHistory.Heading === "") return;
      let predObject = currentHistory;
      let wordMapper: any = {};
      let allDurations: any = [0.0];
      for (let i = 0; i < predObject.ProcessedData.length; i++) {
        wordMapper[predObject.ProcessedData[i].current_duration] = i;
        allDurations.push(predObject.ProcessedData[i].current_duration);
      }
      // allDurations.push(predObject.ProcessedData[predObject.ProcessedData.length - 1].current_duration);

      
      if (playerRef.current) {
        const currentTime = (playerRef.current as ReactPlayer).getCurrentTime();
        let curTime = currentTime.toFixed(2);

        if (Number(curTime) === 0.00) return;

        // if (curTime < allDurations[0]) return;

        for (let i = 1; i < allDurations.length; i++) {    
          console.log(curTime, allDurations[i - 1], allDurations[i]);      
          if (curTime > allDurations[i-1] && curTime <= allDurations[i]) {
            let sentence = predObject.ProcessedData[wordMapper[allDurations[i]]].sentence_till_now;
            setTranslatedHistorySentence(sentence);
            let llm_prediction = predObject.ProcessedData[wordMapper[allDurations[i]]].llm_prediction;
            if (llm_prediction === undefined || llm_prediction === null || llm_prediction === ""){
              setTranslatedHistoryLLm(sentence);
            }
            else{
              setTranslatedHistoryLLm(
                predObject.ProcessedData[wordMapper[allDurations[i]]]
                  .llm_prediction,
              );
            }
            return;
          }
        }
      }
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [currentHistory]);

  // useEffect(() => {
  //   let i = 0;
  //   try {
  //     // const interval = setInterval(() => {
  //     //   setTranslatedHistory(currentHistory.ProcessedData[i].sentence_till_now);
  //     //   setTimeout(() => {
  //     //     setTranslatedHistory(
  //     //       currentHistory.ProcessedData[i++].llm_prediction
  //     //     );
  //     //   }, 500);
  //     // }, 1000);

  //     (async ()=>{
  //       currentHistory.ProcessedData.forEach(async (word)=>{
  //         setTimeout(()=>{
  //           setTranslatedHistorySentence(word.sentence_till_now);
  //           setTranslatedHistoryLLm(word.llm_prediction);
  //         },word.current_duration*1000);
  //       });
  //     })();
  //     // setTimeout(() => {
  //     //   clearInterval(interval);
  //     // }, currentHistory.ProcessedData.length * 1000);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [currentHistory]);
  return (
    <div className="History">
      <div className="HistoryCards">
        {userVideoUrls.map((video) => {
          if (video.processed_video_uri !== "") {
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
                  // console.log(video);
                  setCurrentHistory({
                    Heading: video.video_uri,
                    Url: video.processed_video_uri,
                    ProcessedData: video.processed_data,
                  });
                }}
              >
                <p style={{ margin: 0, fontSize: "1.2rem" }}>{}</p>
                <p style={{ margin: 0 }}>
                  {video.url.substring(0, 30) + ". . ."}
                </p>
              </Card>
            );
          }
        })}
      </div>
      <div className="HistoryCardDetails">
        {currentHistory.Heading !== "" && (
          <h3 style={{ color: "white", fontFamily: "Play" }}>
            <span style={{ marginRight: "3%" }}>
              {currentHistory.Url.substring(0, 73) + ". . ."}
            </span>
            <span
              className="copyToClipBoard"
              onClick={async () => {
                await window.navigator.clipboard.writeText(currentHistory.Url);
                (
                  document.getElementById(
                    "AfterCopyToClipBoard",
                  ) as HTMLObjectElement
                ).style.display = "block";
                setTimeout(() => {
                  document.getElementById(
                    "AfterCopyToClipBoard",
                  )!.style.display = "none";
                }, 1500);
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
                playing={false}
                ref={playerRef}
                // onProgress={handleProgress}
              ></ReactPlayer>
            </div>
            <div className="HistoryTranslation">
              <Select                
                  defaultValue="select"
                  style={{ width: 120 }}
                  onChange={handleChange}
                  options={[
                    { value: 'select', label: 'Select Language' },
                    { value: 'french', label: 'French' },
                    { value: 'hindi', label: 'Hindi' },
                    { value: 'bengali', label: 'Bengali' },
                    { value: 'german', label: 'German' },
                    { value: 'spanish', label: 'Spanish' },
                    { value: 'japanese', label: 'Japanese' },
                  ]}
                />
                <br />
                <br />
                Raw Predictions:- {TranslatedHistorySentence}
                <br />
                LLM Predicted :- {TranslatedHistoryLLm}
              {/* <div className="WordTillNow">
                
              </div>
              <div className="FullSentence">
                
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
