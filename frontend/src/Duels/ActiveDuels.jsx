import React from "react";
import data from "./data";
import "./activeDuels.css";
import { Link } from "react-router-dom";

const ActiveDuels = () => {
  return (
    <section className="duel-box">
      <div className="container-duel ">
        <h2>active duels</h2>
        <main className="card-container">
        {data.map((data) => (
          <Link to={`/duels/${data.duelId}`} key={data.duelId}>
          <div className="duelCard">
            <div className="img-wrapper">
            <img className="duel-img" src={data.avatar} alt="clone" />
            </div>
            <div className="text-wrapper">
              <h4>Duel ID</h4>
              <p className="duel-id">{data.duelId}</p>
            </div>
            <div className="text-wrapper">
              <h4>Stake</h4>
            <p className="duel-stake">{data.stake}</p>
            </div>
            <div className="text-wrapper">
              <h4>Creator</h4>
            <p className="duel-creator">{data.duelCreator}</p>
            </div>
          </div>
        </Link>
        ))}
        </main>
        
      </div>
    </section>
  );
};

export default ActiveDuels;
