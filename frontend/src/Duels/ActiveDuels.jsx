import React from "react";
import data from "./data";
import "./activeDuels.css";

const ActiveDuels = () => {
  return (
    <section className="duel-box flex">
      <div className="container-duel ">
        <h2>active duels</h2>
        {data.map((data) => (
          <div className="duelCard flex">
            <p className="duel-id">{data.duelId}</p>
            <img className="duel-img" src={data.avatar} alt="clone" />
            <p className="duel-stake">{data.stake}</p>
            <p className="duel-creator">{data.duelCreator}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActiveDuels;
