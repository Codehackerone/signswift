import React from "react";
import "../componentsCss/LanguageDetailsCss.css";

export default function LanguageDetails() {
  return (
    <div>
      <div className="LanguageHeadingTop d-flex flex-column align-items-center justify-content-center">
        <div className="languageHeading">
          <span>Let Your Hands Speak Multiple Languge</span>
        </div>
        <div className="languageHeading1">
          <span>Available Languages : </span>
        </div>
      </div>
      <div
        className="LanguageDetails d-flex justify-content-evenly align-items-center"
        style={{ fontSize: "50px" }}
      >
        <div className="left">
          <span style={{ opacity: "0" }}>left</span>
        </div>
        <div
          className="languageContainer d-flex justify-content-evenly align-items-center"
          style={{ width: "100%", height: "100%" }}
        >
          <div className="languageItem container d-flex justify-content-center">
            <div className="english">English</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="german">Deutsch</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="french">français</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="latin">Latina</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="greek">Έλλην</div>
          </div>
        </div>
        <div
          className="languageContainer d-flex justify-content-evenly align-items-center"
          style={{ width: "100%", height: "100%" }}
        >
          <div className="languageItem container d-flex justify-content-center">
            <div className="english">English</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="german">Deutsch</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="french">français</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="latin">Latina</div>
          </div>
          <div className="languageItem container d-flex justify-content-center">
            <div className="greek">Έλλην</div>
          </div>
        </div>
        <div className="right">
          <span style={{ opacity: "0" }}>right</span>
        </div>
      </div>
    </div>
  );
}
