import React from "react";

const TeamCard = ({ title, name, img, noChar, nebBal, gamePoints }) => {
  return (
    <>
      <div className="outTeamCard flex alignCenter">
          <a href="/"><img src={img} alt={`Our Team ${name}`} /></a>
          <h3>{name}</h3>
          <h5>{title}</h5>
          <h5>No of Characters: {noChar}</h5>
          <h5>Game Points: {gamePoints} pts</h5>
          <h5>Nebula Balance: {nebBal} $neb</h5>
          
      </div>
    </>
  );
};

export default TeamCard;
