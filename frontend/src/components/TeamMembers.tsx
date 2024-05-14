import React from "react";
import Login from "../ImageResources/login.png"

interface Props{
    flexDirection : String,
    name : String,
    description : String
}

export default function TeamMember(props:Props) {
  return (
    <div
      className={`teamMember d-flex ${props.flexDirection} align-items-center`}
    >
      <div className="circlePhoto d-flex align-items-center justify-content-center">
        <img
          className="innerPhoto"
          src={Login}
          alt=""
        />
      </div>
      <div
        className={`name d-flex align-items-center ${props.flexDirection} p-2`}
        style={
          props.flexDirection === "flex-row"
            ? { left: " 24.5%", boxShadow : "2px 2px 1.5px 0px #314438" }
            : { right: "24.5%", boxShadow : "-2px 2px 1.5px 0px #314438" }
        }
      >{props.name}</div>
      <div
        className="boxDetails d-flex"
        style={
          props.flexDirection === "flex-row" ? { left: " 8%", justifyContent: "flex-end", boxShadow : "1px 1px 1px 0 whitesmoke" } : { right: "8%", justifyContent:"flex-start", boxShadow : "-1px 1px 1px 0 whitesmoke" }
        }
      >
        <div className="boxDetailsText ">
          {props.description}
        </div>
      </div>
      <div
        className="boxDetailsBack"
        style={
          props.flexDirection === "flex-row" ? { left: " 9%" } : { right: "9%" }
        }
      ></div>
    </div>
  );
}
