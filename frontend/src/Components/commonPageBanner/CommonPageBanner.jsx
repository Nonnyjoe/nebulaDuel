import React from "react";
import "./pageBanner.css";
import { Link } from "react-router-dom";

const CommonPageBanner = ({ title, img }) => {
  return (
    <>
      <section className="pageBanner" style={img? {} : {padding: "200px 0 150px 0"}}>
        <div className={`container flex ${img ? "justifySpaceBet": "justifyCenter"} alignCenter`}>
          <div className="content">
            <h2>{title}</h2>
            <h5 className={img ? "" : "textAlignCenter"}>
              <Link to="/">HOME</Link> <span>{title}</span>
            </h5>
          </div>
          {img && (
            <div className="image">
              <img src={img} alt="breadcrumb_img01" />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CommonPageBanner;
