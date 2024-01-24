import React from "react";

const TeamCard = ({ title, name, img }) => {
  return (
    <>
      <div className="outTeamCard flex alignCenter">
          <a href="/"><img src={img} alt={`Our Team ${name}`} /></a>
          <h3>{name}</h3>
          <h5>{title}</h5>
      </div>
    </>
  );
};

export default TeamCard;
