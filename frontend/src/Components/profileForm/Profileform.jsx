import React from "react";
// import { BsFillCaretRightFill, BsFillCaretLeftFill } from "react-icons/bs";
import "./profile.css";
import TeamCard from "../Cards/TeamCard";


const ContactUsForm = () => {
  return (
    <>
      <div className="contactUs commonSection">
        <div className="container flex">
          <div className="content">
            <h6>Create your profile</h6>
            <p>
             Are you ready to be a Gamer?
             Create yoir profile and let's get started 
            </p>
            <TeamCard img={"assets/img/team01.png"} name={"KILLER MASTER"} title={"Blockchain Expert"} />
            {/* <h4 className="flex alignCenter">
              <span className="flex green">
                <BsFillCaretLeftFill />
              </span>
              <BsFillCaretRightFill /> <span className="text">INFORMATION</span>
            </h4>
            <p>
              <a href="tel: +971 333 222 557">+971 333 222 557</a>
            </p>
            <p>
              <a href="mailto: info@exemple.com">info@exemple.com</a>
            </p>
            <p>New Central Park W7 Street, New York</p> */}
          </div>

          <div className="form">
            <form action="/">
                <div className="two flex">
                    <input type="text" placeholder="Enter Your Name*" />
                    <input type="text" placeholder="Enter Your Email*" />
                </div>
                <textarea name="message" id="" cols="30" rows="10" placeholder="Enter Your Message"></textarea>

                <button className="submitButton" type="submit">SUBMIT NOW</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsForm;
