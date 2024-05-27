import React from "react";
import "../componentsCss/ImageSliderCss.css";
import ImageSliderBg1 from "../ImageResources/imageslider1.png";
import ImageSliderBg2 from "../ImageResources/imageslider2.png";
import { Link } from "react-router-dom";

export default function ImageSlider() {
  return (
    <>
      <div className="ImageSlider d-flex justify-content-between align-items-center">
        <img
          src={ImageSliderBg1}
          alt=""
          style={{ width: "21%", height: "100%", marginLeft: "10%" }}
        />
        <div
          className="d-flex flex-column align-items-center justify-content-evenly"
          style={{
            maxWidth: "30%",
            backgroundColor: "white",
            borderRadius: "20px",
            height: "70%",
            boxShadow: "0 0 10px 10px white",
          }}
        >
          <div
            className="sliderText d-flex flex-column justify-content-evenly align-items-center"
            style={{
              textAlign: "center",
              borderRadius: "20px 20px 0 0",
              fontSize: "160%",
              fontWeight: "bolder",
              color: "#001529",
            }}
          >
            <span className="sliderTextHeading">
              Empowering Communication for the Deaf and Hard of Hearing
              Community
            </span>
          </div>
          <div
            className="d-flex flex-column justify-content-evenly align-items-center"
            style={{ textAlign: "center", borderRadius: "0 0 20px 20px" }}
          >
            <ul
              className="p-0"
              style={{ listStyle: "none", fontSize: "80%", color: "#001529" }}
            >
              <li>&#10003; Easy To Set Up</li>
              <li>&#10003; Just Login</li>
              <li>&#10003; Select Language</li>
              <li>&#10003; And Get Those Hands Talking</li>
            </ul>
          </div>
        </div>
        <img
          src={ImageSliderBg2}
          alt=""
          style={{ width: "21%", height: "100%", marginRight: "10%" }}
        />
        <Link className="loginButtonContainer" to={"/login"}>
          <button className="loginButton">
            New To SignSwift? Lets's Get Started &gt;&gt;
          </button>
        </Link>
      </div>
    </>
  );
}
