import React from "react";
import "./whoWeAre.css";
import { TbGridDots } from 'react-icons/tb';

const WhoWeAre = () => {
  return (
    <>
      <div className="whoWeAre commonSection">
        <div className="container flex">
          <div className="headContent">
            <h6>
              WE ARE <span className="green">DEVELOPER</span> ERN NFT GAM
              <span className="fontw">ING</span>
            </h6>

            <div className="rotater">
              <img src="assets/img/circle.svg" alt="" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 150 150"
                version="1.1"
              >
                <path id="textPath" d="M 0,75 a 75,75 0 1,1 0,1 z"></path>
                <text>
                  <textPath href="#textPath">super nft Gaming sits</textPath>
                </text>
              </svg>
            </div>
          </div>

          <div className="mainContent">
            <div className="image flex">
              <div className="img_1">
                <img src="assets/img/mask_img01.jpg" alt="" />
                <div className="sideGreen"></div>
              </div>
              <div className="img_2">
                <div className="dots">
                  <TbGridDots />
                  <TbGridDots />
                  <TbGridDots />
                </div>
                <img src="assets/img/mask_img02.jpg" alt="" />
              </div>
            </div>
            <p>
              Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum
              sollicitudin is yaugue euismods Nulla ullamcorper. Morbi pharetra
              tellus miolslis tincidunt massa venenatis. Lorem Ipsum is simply
              dummyd the printing and typesetting industry. Lorem Ipsum has been
              the industry's standard dummy text ever since the 1500s when an
              unknown printer took a galley.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhoWeAre;
