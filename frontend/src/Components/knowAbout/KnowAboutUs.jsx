
import React, { useEffect } from "react";
import Heading from "../heading/Heading";
import "./aboutUs.css";

// For react Crowsel
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const KnowAboutUs = () => {
  const tabChangeButtons = (ind) => {
    const knowAboutTab = document.getElementsByClassName("knowAboutTab");
    const tabButtonsKnowAbout = document.getElementsByClassName(
      "tabButtonsKnowAbout"
    );

    for (let i = 0; i < knowAboutTab.length; i++) {
      knowAboutTab[i].classList.remove("ActiveTab");
    }
    for (let i = 0; i < tabButtonsKnowAbout.length; i++) {
      tabButtonsKnowAbout[i].classList.remove("buttonActive");
    }
    tabButtonsKnowAbout[ind].classList.add("buttonActive");
    knowAboutTab[ind].classList.add("ActiveTab");
  };

  useEffect(() => {
    tabChangeButtons(0);
  }, []);

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 3,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <>
      <div className="knowAboutUs commonSection">
        <div className="container">
          <Heading description="KNOW ABOUT US" title="TOP RATED Gamers" />
          <div className="buttons flex justifyCenter">
            <button className="buyGreen">BUY HERO</button>
            <button className="buyYellow">BUY POINTS</button>
          </div>

          <div className="tabPower">
            <div className="tabs flex justifyCenter flexWrap">
              <button
                className="tabButtonsKnowAbout"
                onClick={() => tabChangeButtons(0)}
              >
                <span></span>
                <img src="assets/img/about_tab01.png" alt="" />
              </button>
              <button
                className="tabButtonsKnowAbout"
                onClick={() => tabChangeButtons(1)}
              >
                <span></span>
                <img src="assets/img/about_tab02.png" alt="" />
              </button>
              <button
                className="tabButtonsKnowAbout"
                onClick={() => tabChangeButtons(2)}
              >
                <span></span>
                <img src="assets/img/about_tab03.png" alt="" />
              </button>
              <button
                className="tabButtonsKnowAbout"
                onClick={() => tabChangeButtons(3)}
              >
                <span></span>
                <img src="assets/img/about_tab04.png" alt="" />
              </button>
              <button
                className="tabButtonsKnowAbout"
                onClick={() => tabChangeButtons(4)}
              >
                <span></span>
                <img src="assets/img/about_tab05.png" alt="" />
              </button>
              <button
                className="tabButtonsKnowAbout"
                onClick={() => tabChangeButtons(5)}
              >
                <span></span>
                <img src="assets/img/about_tab06.png" alt="" />
              </button>
            </div>
            <div className="allTabls">
              <div className="knowAboutTab tab flex">
                <div className="image">
                  <img src="assets/img/about_img01.jpg" alt="" />
                </div>
                <div className="content flex">
                  <h3>JJHBKTAL</h3>
                  <h4>RATE 50%</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                    Morbi pharetra tellus miolslis, tincidunt massa venenatis.
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                  </p>
                  <div className="button flex justifySpaceBet">
                    <button>DRAGON BALL</button>
                    <button>NFT MARKET</button>
                    <button>SUPPORT</button>
                  </div>
                </div>
              </div>
              <div className="knowAboutTab tab flex">
                <div className="image">
                  <img src="assets/img/about_img02.jpg" alt="" />
                </div>
                <div className="content flex">
                  <h3>MICHAEL</h3>
                  <h4>RATE 50%</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                    Morbi pharetra tellus miolslis, tincidunt massa venenatis.
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                  </p>
                  <div className="button flex justifySpaceBet">
                    <button>DRAGON BALL</button>
                    <button>NFT MARKET</button>
                    <button>SUPPORT</button>
                  </div>
                </div>
              </div>
              <div className="knowAboutTab tab flex">
                <div className="image">
                  <img src="assets/img/about_img03.jpg" alt="" />
                </div>
                <div className="content flex">
                  <h3>SHAHEEN</h3>
                  <h4>RATE 50%</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                    Morbi pharetra tellus miolslis, tincidunt massa venenatis.
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                  </p>
                  <div className="button flex justifySpaceBet">
                    <button>DRAGON BALL</button>
                    <button>NFT MARKET</button>
                    <button>SUPPORT</button>
                  </div>
                </div>
              </div>
              <div className="knowAboutTab tab flex">
                <div className="image">
                  <img src="assets/img/about_img04.jpg" alt="" />
                </div>
                <div className="content flex">
                  <h3>MARCUS</h3>
                  <h4>RATE 50%</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                    Morbi pharetra tellus miolslis, tincidunt massa venenatis.
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                  </p>
                  <div className="button flex justifySpaceBet">
                    <button>DRAGON BALL</button>
                    <button>NFT MARKET</button>
                    <button>SUPPORT</button>
                  </div>
                </div>
              </div>
              <div className="knowAboutTab tab flex">
                <div className="image">
                  <img src="assets/img/about_img05.jpg" alt="" />
                </div>
                <div className="content flex">
                  <h3>0XBLACKADAM</h3>
                  <h4>RATE 50%</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                    Morbi pharetra tellus miolslis, tincidunt massa venenatis.
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                  </p>
                  <div className="button flex justifySpaceBet">
                    <button>DRAGON BALL</button>
                    <button>NFT MARKET</button>
                    <button>SUPPORT</button>
                  </div>
                </div>
              </div>
              <div className="knowAboutTab tab flex">
                <div className="image">
                  <img src="assets/img/about_img06.jpg" alt="" />
                </div>
                <div className="content flex">
                  <h3>NONNYJOE</h3>
                  <h4>RATE 50%</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                    Morbi pharetra tellus miolslis, tincidunt massa venenatis.
                    Lorem ipsum dolor sit amet, consteur adipiscing Duis
                    elementum sollicitudin is yaugue euismods Nulla ullamcorper.
                  </p>
                  <div className="button flex justifySpaceBet">
                    <button>DRAGON BALL</button>
                    <button>NFT MARKET</button>
                    <button>SUPPORT</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mainCrowsel commonSection">
          <Carousel responsive={responsive} centerMode={window.innerWidth > 380 ? true : false} infinite={true} showDots={true}>
            <div className="slide">
              <div className="image">
                <img src="assets/img/gallery01.jpg" alt="" />
              </div>
              <div className="content flex justifySpaceBet alignCenter">
                <h3>DOTA 2 TOURNAMENT</h3>
                <h5>RATE 85%</h5>
              </div>
            </div>
            <div className="slide">
              <div className="image">
                <img src="assets/img/gallery02.jpg" alt="" />
              </div>
              <div className="content flex justifySpaceBet alignCenter">
                <h3>DOTA 2 TOURNAMENT</h3>
                <h5>RATE 85%</h5>
              </div>
            </div>
            <div className="slide">
              <div className="image">
                <img src="assets/img/gallery03.jpg" alt="" />
              </div>
              <div className="content flex justifySpaceBet alignCenter">
                <h3>DOTA 2 TOURNAMENT</h3>
                <h5>RATE 85%</h5>
              </div>
            </div>
            <div className="slide">
              <div className="image">
                <img src="assets/img/gallery04.jpg" alt="" />
              </div>
              <div className="content flex justifySpaceBet alignCenter">
                <h3>DOTA 2 TOURNAMENT</h3>
                <h5>RATE 85%</h5>
              </div>
            </div>
            <div className="slide">
              <div className="image">
                <img src="assets/img/gallery05.jpg" alt="" />
              </div>
              <div className="content flex justifySpaceBet alignCenter">
                <h3>DOTA 2 TOURNAMENT</h3>
                <h5>RATE 85%</h5>
              </div>
            </div>
          </Carousel>
          ;
        </div>
      </div>
    </>
  );
};

export default KnowAboutUs;
