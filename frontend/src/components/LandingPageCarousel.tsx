import React from "react";
import { Carousel } from "antd";
import ImageSlider from "./ImageSlider";
import ImageSlider2 from "./ImageSlider2";
import LanguageDetails from "./LanguageDetails";

export default function LandingPageCarousel() {
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
