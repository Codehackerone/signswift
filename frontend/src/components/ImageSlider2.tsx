import React from "react";
import "../componentsCss/ImageSlider2Css.css";
import A from "../ImageResources/BG _removed/A.png";
import E from "../ImageResources/BG _removed/E.png";
import H from "../ImageResources/BG _removed/H.png";
import L from "../ImageResources/BG _removed/L.png";
import O from "../ImageResources/BG _removed/O.png";
import R from "../ImageResources/BG _removed/R.png";
import U from "../ImageResources/BG _removed/U.png";
import W from "../ImageResources/BG _removed/W.png";
import Y from "../ImageResources/BG _removed/Y.png";
import Arrow from "../ImageResources/arrow.png";

export default function ImageSlider2() {
  return (
    <div style={{backgroundColor:"#e4f2ff" }}>
      <div className="ImageSlider2 container d-flex flex-column justify-content-center align-items-center">
        <div className="ImgSlide2ExtraInfo d-flex flex-column align-items-start justify-content-between">
          <div className="Extraheading">Learn Hand Sign Effortlessly</div>
          <div className="ExtraInfo">&#10003; Extra Info</div>
          <div className="ExtraInfo">&#10003; Extra Info</div>
          <div className="ExtraInfo">&#10003; Extra Info</div>
        </div>
        <div
          className="outerImageSlider2 container"
          style={{ marginLeft: "13px" }}
        >
          <div
            // className="hellohowareyou d-flex justify-content-evenly align-items-center"
            className="hellohowareyou row"
            style={{ width: "100%", position: "relative", top: "-80%" }}
          >
            <div className="Hello col text-center" style={{position:"relative"}}>
              <div className="d-flex flex-column justify-content-center align-items-center">
                <span>Hello</span>
                <img
                  src={Arrow}
                  alt=""
                  style={{
                    width: "75px",
                    height: "30px",
                    transform: "rotate(90deg)",
                    position: "absolute",
                    top: "125%",
                  }}
                />
              </div>
            </div>
            <div className="How col text-center">
              <div className="d-flex flex-column justify-content-center align-items-center">
                <span>How</span>
                <img
                  src={Arrow}
                  alt=""
                  style={{
                    width: "75px",
                    height: "30px",
                    transform: "rotate(90deg)",
                    position: "absolute",
                    top: "125%",
                  }}
                />
              </div>
            </div>
            <div className="Are col text-center">
              <div className="d-flex flex-column justify-content-center align-items-center">
                <span>Are</span>
                <img
                  src={Arrow}
                  alt=""
                  style={{
                    width: "75px",
                    height: "30px",
                    transform: "rotate(90deg)",
                    position: "absolute",
                    top: "125%",
                  }}
                />
              </div>
            </div>
            <div className="You col text-center">
              <div className="d-flex flex-column justify-content-center align-items-center">
                <span>You</span>
                <img
                  src={Arrow}
                  alt=""
                  style={{
                    width: "75px",
                    height: "30px",
                    transform: "rotate(90deg)",
                    position: "absolute",
                    top: "125%",
                  }}
                />
              </div>
            </div>
          </div>
          <div
            // className="handsignimg d-flex justify-content-between align-items-center"
            className="handsignimg row"
            style={{ width: "100%", position: "relative", top: "-25%", height:"11vh" }}
          >
            <div
              className="hello col"
              style={{
                boxShadow: "0 0 20px 0px rgb(169 186 204)",
                borderRadius: "20px",
                margin: "0 10px",
              }}
            >
              <img src={H} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={E} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={L} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={L} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={O} alt="" style={{ width: "75px", height: "75px" }} />
            </div>
            <div
              className="how col"
              style={{
                boxShadow: "0 0 20px 0px rgb(169 186 204)",
                borderRadius: "20px",
                margin: "0 10px",
              }}
            >
              <img src={H} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={O} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={W} alt="" style={{ width: "75px", height: "75px" }} />
            </div>
            <div
              className="are col"
              style={{
                boxShadow: "0 0 20px 0px rgb(169 186 204)",
                borderRadius: "20px",
                margin: "0 10px",
              }}
            >
              <img src={A} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={R} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={E} alt="" style={{ width: "75px", height: "75px" }} />
            </div>
            <div
              className="you col"
              style={{
                boxShadow: "0 0 20px 0px rgb(169 186 204)",
                borderRadius: "20px",
                margin: "0 10px",
              }}
            >
              <img src={Y} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={O} alt="" style={{ width: "75px", height: "75px" }} />
              <img src={U} alt="" style={{ width: "75px", height: "75px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
