import React from "react";
import "./Banner.css";

const Banner = () => {
  return (
    <>
      <section className="mainBanner">
        <div className="container flex alignCenter">
          <div className="content">
            <h3>LIVE GAMING</h3>
            <h1 className="textGreenShadow">STEAMING</h1>
            <h3>VIDEO GAMES ONLINE</h3>
            <a className="glButtonFill" href="/">
              <span className="flex alignCenter">CONTACT US</span>
            </a>
          </div>
          <div className="image">
           <img src="assets/img/slider_img01.png" alt="" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
