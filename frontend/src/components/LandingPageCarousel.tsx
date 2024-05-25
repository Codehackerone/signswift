import React, { useContext, useEffect } from "react";
import { Carousel } from "antd";
import ImageSlider from "./ImageSlider";
import ImageSlider2 from "./ImageSlider2";
import LanguageDetails from "./LanguageDetails";
import { loginContext } from "../contexts/LoginProvider";
import { useNavigate } from "react-router-dom";

export default function LandingPageCarousel() {
  const navigate = useNavigate();
  useEffect(()=>{
    if (localStorage.getItem("currentuser")!==null) {
      navigate("/user/LiveTranslation");
    }
  },[]);
  return (
    <div>
      <Carousel autoplay={true} dots={false}>
        <div>
          <ImageSlider></ImageSlider>
        </div>
        <div>
          <ImageSlider2></ImageSlider2>
          
        </div>
      </Carousel>
      <LanguageDetails></LanguageDetails>
    </div>
  );
}
