import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Heading from "../heading/Heading";
import "./powerfulSer.css";
import { SlDiamond } from "react-icons/sl";
import { ImUserPlus } from "react-icons/im";
import { TbCurrencyEthereum } from "react-icons/tb";
import { AiFillSetting } from "react-icons/ai";

const PowerFulSer = () => {
  const [pathImg, setPathImg] = useState("/")
  const powerfunServicesImg = useRef();

  const allImages = [
    "assets/img/services_img01.jpg",
    "assets/img/services_img02.jpg",
    "assets/img/services_img03.jpg",
    "assets/img/services_img04.jpg",
  ];
  const path = ["/", "/aboutus", "/contactus", "/"];
  const changeImageOnHover = (index) => {
    const imgSource = powerfunServicesImg.current;
    imgSource.src = allImages[index];
    setPathImg(path[index]);
  };

  return (
    <>
      <div className="powerFulService commonSection">
        <div className="container flex">
          <div className="content">
            <Heading
              description={"POWERFUL SERVICES"}
              title_1={"OUR POWERFUL SERVICES DONE ON TIME"}
            />
            <div className="cards flex flexWrap justifySpaceBet">
              <div className="card" onMouseOver={() => changeImageOnHover(0)}>
                <SlDiamond />
                <h4>Year Experience</h4>
                <p>
                  Lorem ipsum dolor sitamet const adipiscng Duis eletum
                  sollicitudin is yaugue euismods
                </p>
              </div>
              <div className="card" onMouseOver={() => changeImageOnHover(1)}>
                <ImUserPlus />
                <h4>Expert Teams</h4>
                <p>
                  Lorem ipsum dolor sitamet const adipiscng Duis eletum
                  sollicitudin is yaugue euismods
                </p>
              </div>
              <div className="card" onMouseOver={() => changeImageOnHover(2)}>
                <TbCurrencyEthereum />
                <h4>Best NFT Game</h4>
                <p>
                  Lorem ipsum dolor sitamet const adipiscng Duis eletum
                  sollicitudin is yaugue euismods
                </p>
              </div>
              <div className="card" onMouseOver={() => changeImageOnHover(3)}>
                <AiFillSetting />
                <h4>Worldwide Client</h4>
                <p>
                  Lorem ipsum dolor sitamet const adipiscng Duis eletum
                  sollicitudin is yaugue euismods
                </p>
              </div>
            </div>
          </div>
          <div className="image">
            <span className="arrowPower">
              <Link className="powerfunServicesAnchor" to={pathImg}>
                ⇉
              </Link>
            </span>
            <img ref={powerfunServicesImg} src={allImages[0]} alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default PowerFulSer;
