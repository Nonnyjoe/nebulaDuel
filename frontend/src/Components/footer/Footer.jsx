import React from "react";
import "./Footer.css";
import { HiChevronDoubleRight } from "react-icons/hi";
import { RiSendPlane2Fill } from "react-icons/ri";

const Footer = () => {
  return (
    <>
      <footer className="footer commonSection">
        <div className="container flex flexWrap">
          <div className="col">
            <div className="logo">
              <img src="assets/img/logo.png" alt="" />
            </div>
            <p>
              Lorem ipsum dolor sitamet consectur adipiscing Duis esollici tudin
              augue euismod. Nulla ullam dolor sitamet consectetur
            </p>
            <h4 className="flex alignCenter">
              ACTIVE &nbsp;{" "}
              <span className="flex alignCenter">
                WITH US &nbsp; <HiChevronDoubleRight />{" "}
              </span>
            </h4>
          </div>
          <div className="col">
            <h3>QUICK LINK</h3>
            <ul>
              <li>
                <a href="/">
                  <p>Gaming</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Product</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>All NFTs</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Social Network</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Domain Names</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Collectibles</p>
                </a>
              </li>
            </ul>
          </div>
          <div className="col">
            <h3>SUPPORTS</h3>
            <ul>
              <li>
                <a href="/">
                  <p>Setting & Privacy</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Help & Support</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Live Auctions</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Item Details</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>24/7 Supports</p>
                </a>
              </li>
              <li>
                <a href="/">
                  <p>Our News</p>
                </a>
              </li>
            </ul>
          </div>
          <div className="col">
            <h3>NEWSLETTER</h3>
            <p>
              Subscribe our newsletter to get our latest update &
              newsconsectetur
            </p>
            <form action="/">
              <input type="email" placeholder="Email" />
              <button className="flex alignCenter" type="submit">
                <RiSendPlane2Fill />
              </button>
            </form>
          </div>
        </div>
        <div className="copy">
          <div className="container flex justifyCenter">
            <p>
              COPYRIGHT © 2024 - ALL RIGHTS RESERVED BY <span>Nebula Duel</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
