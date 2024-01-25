import React, { useEffect, useRef, useState } from "react";
import "./Header.css";
import Nav from "../navigation/Nav";
import { BiSearchAlt2 } from "react-icons/bi";
import { TbEditCircle } from "react-icons/tb";
import { RiSendPlane2Fill } from "react-icons/ri";
import { BsTwitter } from "react-icons/bs";
import { GiCrossedSwords } from "react-icons/gi";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Network } from "../../Network";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";

const Header = () => {
  const sideBar = useRef();
  const sideBarFull = useRef();
  const searchBox = useRef();
  const headerMain = useRef();
  const overLayBackgroundPhone = useRef();

  useEffect(() => {
    window.onscroll = function () {
      scrollFunction();
    };
  }, []);

  function scrollFunction() {
    const mainHeader = headerMain.current;
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      mainHeader.classList.add("scrollHeader");
    } else {
      mainHeader.classList.remove("scrollHeader");
    }
  }

  const NavInPhone = () => {
    const navBackGround = overLayBackgroundPhone.current;
    navBackGround.classList.toggle('overLayBackgroundPhoneShow');
    document.querySelector('nav').classList.toggle('showNavInPhone');
    window.scrollTo(0, 0);
  }

  const togleSideBar = () => {
    const workSideBar = sideBar.current;
    const workSideBarBlack = sideBarFull.current;
    workSideBar.classList.toggle("ShowSideBar");
    workSideBarBlack.classList.toggle("wholeScreenShow");
  };
  const togleSearchBox = () => {
    const searchBoxEle = searchBox.current;
    searchBoxEle.classList.toggle("showSearchBox");
  };


  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
  };



  return (
    <>
      <header ref={headerMain}>
        <div className="container flex alignCenter justifySpaceBet">
          <div className="logo">
            <Link to="/">
              <img src="assets/img/logo.png" alt="" />
            </Link>
          </div>
          <div onClick={NavInPhone} ref={overLayBackgroundPhone} className="overLayBackgroundPhone"></div>
          <Nav closeFunction={NavInPhone} />
          <div className="menues flex alignCenter">
            <span onClick={togleSearchBox} className="search flex alignCenter">
              <BiSearchAlt2 />
            </span>
            <span className="glButtonBorder flex alignCenter" onClick={handleConnectWallet} >
              <TbEditCircle />
              <Network
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              isConnected={isWalletConnected}
            />
            </span>
            <div onClick={NavInPhone} className="phoneMenu flex alignCenter">
              <FaBars />
            </div>
            <div onClick={() => togleSideBar()} className="bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div
          onClick={() => togleSideBar()}
          ref={sideBarFull}
          className="wholeScreen"
        ></div>
        <div ref={sideBar} className="headerSideBar">
          <div className="logo">
            <span onClick={() => togleSideBar()} className="swordClose">
              <GiCrossedSwords />
            </span>
            <a href="/">
              <img src="assets/img/logo.png" alt="" />
            </a>
          </div>
          <div className="content">
            <h3>
              BEST SELLER OF MONTH IDEAS FOR <span>NFT WALLET</span>
            </h3>

            <div className="contact commonSideCard">
              <h5>CONTACT US</h5>
              <p className="flex alignCenter">
                <span></span> <a href="tel:9030769242">+9 030 769 242</a>
              </p>
              <p className="flex alignCenter">
                <span></span>{" "}
                <a href="mailto:info@webmail.com">info@webmail.com</a>
              </p>
              <p className="flex alignCenter">
                <span></span> Igbogbo, Ikorodu ,Lagos.
              </p>
            </div>
            <div className="subscribe commonSideCard">
              <h5>SUBSCRIBE</h5>
              <form action="/">
                <input type="text" placeholder="Get News & Updates" />
                <button className="flex alignCenter">
                  <RiSendPlane2Fill />
                </button>
              </form>
              <p>
                Subscribe dolor sitamet, consectetur adiping eli. Duis esollici
                tudin augue.
              </p>
            </div>

            <div className="socal commonSideCard">
              <a href="/">
                <BsTwitter />
              </a>
              <a href="/">
                <FaFacebookF />
              </a>
              <a href="/">
                <FaLinkedinIn />
              </a>
              <a href="/">
                <FaYoutube />
              </a>
            </div>
          </div>

          <div className="sideFoot">
            <p>
              COPYRIGHT © 2023 - BY <span>Nebula Duel</span>
            </p>
          </div>
        </div>
      </header>
      <div className="searchBox" ref={searchBox}>
        <div className="container flex justifyCenter alignCenter">
          <span onClick={togleSearchBox} className="searchBoxClose">
            <GiCrossedSwords />
          </span>
          <div className="content">
            <h2 className="textGreenShadow">... SEARCH HERE ...</h2>
            <form action="/">
              <input type="text" placeholder="Type Keyword Here" />
              <button type="submit">
                <BiSearchAlt2 />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
