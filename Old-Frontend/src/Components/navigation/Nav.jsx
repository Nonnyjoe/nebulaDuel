import React from "react";
import "./Nav.css";
import { GiCrossedSwords } from "react-icons/gi";
import { TbEditCircle } from "react-icons/tb";
import { NavLink } from "react-router-dom";

const Nav = ({ closeFunction }) => {
  return (
    <>
      <nav>
        <span onClick={closeFunction} className="phoneNavClose">
          {" "}
          <GiCrossedSwords />
        </span>
        <ul className="flex navBar">
          <li>
            <NavLink onClick={closeFunction} to="/">
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink onClick={closeFunction} to="/about">ABOUT US</NavLink>
          </li>
          {/* <li>
            <a onClick={closeFunction} href="/">TOURNAMENT</a>
          </li> */}
          <li>
            <NavLink onClick={closeFunction} to="/profile">PROFILE</NavLink>
          </li>
          {/* <li>
            <a onClick={closeFunction} href="/">NEWS</a>
          </li> */}
          <li>
            <NavLink onClick={closeFunction} to="/contactus">CONTACT US</NavLink>
          </li>
        </ul>
        <a className="glButtonBorder flex alignCenter" href="/">
          <TbEditCircle /> ~Connect Wallet
        </a>
      </nav>
    </>
  );
};

export default Nav;
