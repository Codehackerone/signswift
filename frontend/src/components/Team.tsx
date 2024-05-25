import React from "react";
import "../componentsCss/TeamCss.css";
import TeamMember from "./TeamMembers";

const Signswift = () => {
  return <span style={{ fontFamily: "Dancing Script" }}>SignSwift</span>;
};
export default function Team() {
  return (
    <div
      className="outerTeam d-flex flex-column align-items-center"
      style={{ whiteSpace: "wrap" }}
    >
      <div className="innerTeam d-flex flex-column justify-content-between">
        <TeamMember
          flexDirection="flex-row"
          name="Soumyajit Dutta"
          description={`Hi, This is Soumyajit here. In this project, I have contributed towards developing and fine-tuning the Machine Learning models used in it.`}
        ></TeamMember>
        <TeamMember
          flexDirection="flex-row-reverse"
          name="Adrisyantee Maiti"
          description={`Hi, This is Adrisyantee here. In this project, I have contributed towards developing the Backend Module of it. This part of the project involves the developing middleware functions to enable the communication of data between the front-end and the backend module.`}
        ></TeamMember>
        <TeamMember
          flexDirection="flex-row"
          name="Ankur Pal"
          description={`Hi, This is Ankur here. In this project, my contributions involves the designing and developing the front-end module of the project. This part of the project involves the designing of the dynamic animations, client-side routing, the contents of front-end designs, etc.`}
        ></TeamMember>
        <TeamMember
          flexDirection="flex-row-reverse"
          name="Debanjan Poddar"
          description={`Hi, This is Debanjan here. In this project, I have contributed towards developing the Backend Module of it. This part of the project involves the developing middleware functions to enable the communication of data between the front-end and the backend module.`}
        ></TeamMember>
      </div>
    </div>
  );
}
