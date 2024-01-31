import React, { useState } from "react";
// import { BsFillCaretRightFill, BsFillCaretLeftFill } from "react-icons/bs";
import "./profile.css";
import TeamCard from "../Cards/TeamCard";
// import { Input } from "../../Input";
import { Input } from "../../utils/input";
import { useRollups } from "../../useRollups";


const ContactUsForm = () => {
  const [dappAddress, setDappAddress] = useState(
    "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"
  );
  const [userName, setUsername] = useState("");
  const [avatar, setAvatar] = useState("MyAvatar");
  const [submitClicked, setSubmitClicked] = useState(false);
  const rollups = useRollups(dappAddress);

  const functionParamsAsString = JSON.stringify({
    method: "create_profile",
    name: userName,
    avatar: avatar,
  });

  const handleSubmit = (e) => {
    if (rollups === undefined) {
      alert ("Problem encountered creating profile, please reload your page and reconnect wallet");
    }
    e.preventDefault();
    setSubmitClicked(true);
    Input(rollups, dappAddress, functionParamsAsString, false);
    // alert("working....")
  };

  return (
    <>
      <div className="contactUs commonSection">
        <div className="container flex">
          <div className="content">
            <h6>Create your profile</h6>
            <p className="child-team">
              Are you ready to be a Gamer? Create your profile and let's get
              started
            </p>
            <TeamCard
              img={"assets/img/team01.png"}
              name={"KILLER MASTER"}
              title={"PLAYER"}
              noChar={3}
              gamePoints={250}
              nebBal={0}
              />
          </div>

          <div className="form">
            <form onSubmit={handleSubmit}>
              <div className="two flex">
                <input
                  type="text"
                  placeholder="Enter Your Name*"
                  id="name"
                  value={userName}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="file-box">
                <p>Upload avatar</p>
                <input
                  type="file"
                  alt="profile avatar"
                  id="avataruri"
                  accept="image"
                  // value={avatar}
                  onChange={(e) => {
                    const avatar = e.target.files[0];
                    setAvatar(avatar);
                  }}
                />
              </div>
              <button className="submitButton" type="submit">
                SUBMIT NOW
              </button>
            </form>
            {/* {submitClicked && (
              <Input
                dappAddress={dappAddress}
                input={functionParamsAsString}
                hexInput={false}
              />
            )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsForm;
