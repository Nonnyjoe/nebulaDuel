import React, { useState, useEffect } from "react";
// import { BsFillCaretRightFill, BsFillCaretLeftFill } from "react-icons/bs";
import "./profile.css";
import TeamCard from "../Cards/TeamCard";
// import { Input } from "../../Input";
import { Input } from "../../utils/input";
import { useRollups } from "../../useRollups";
import { ethers } from "ethers";
// import RenderNotices from "../../utils/RenderNotices";
import { Notices } from "../../Notices";
import { useConnectedAddress } from "../../ConnectedAddressContext";



const ContactUsForm = () => {
  const [dappAddress, setDappAddress] = useState(
    "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"
  );
  // const [userAddress, setUserAddress] = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const [allProfiles, setAllProfiles] = useState("");
  const [userData, setUserData] = useState();
  const [userName, setUsername] = useState("");
  const [avatar, setAvatar] = useState("MyAvatar");
  const [submitClicked, setSubmitClicked] = useState(false);
  const { connectedAddress } = useConnectedAddress();
  const rollups = useRollups(dappAddress);
  const [noticeGenerated, setNoticeGenerated] = useState(false)


  const functionParamsAsString = JSON.stringify({
    method: "create_profile",
    name: userName,
    avatar: avatar,
  });


  function cutWalletAddress(address) {
    // Check if the address is a string and has at least 10 characters
    if (typeof address !== 'string' || address.length < 10) {
        return 'Invalid address';
    }

    // Extract the first 5 characters
    const firstPart = address.substring(0, 7);

    // Extract the last 5 characters
    const lastPart = address.substring(address.length - 7);

    // Concatenate the first and last parts
    const cutAddress = firstPart + '...' + lastPart;

    return cutAddress;
}


  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8080/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'query { notices(last: 30 ) { totalCount, edges{ node{ index, payload, } } } }',
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
  
        let data = await response.json();
        data = data.data.notices.edges;
        // console.log('Data from GraphQL:', data);
        let JsonResponse = extractPayloadValues(data);
        let latestProfiles = getObjectWithHighestId(JsonResponse, "all_Players");
        setAllProfiles(latestProfiles.data);
        let userData = extractUserDetails(latestProfiles.data);
        console.log(`JsonResponse is:`, userData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, 2000); // Trigger every 20 seconds
  
    return () => clearInterval(intervalId); // Clean up interval when component unmounts
  }, []);

  // Function to extract the payload and convert it to a json object
  function extractPayloadValues(arrayOfObjects) {
    let payloadValues = [];
    for (let obj of arrayOfObjects) {
        if ('node' in obj) {
            payloadValues.push(JSON.parse(handleNoticeGenerated(obj.node.payload)));
        }
    }
    // Return the array of payload values
    return payloadValues;
  }

  // Function that collects an array of objects, then gets the object with the same method and the highest Id number.
  function getObjectWithHighestId(objects, methodName) {
    let filteredObjects = objects.filter(obj => obj.method === String(methodName)); // Filter objects with the specified method name
    console.log("found", filteredObjects);
    if (filteredObjects.length === 0) return null; // If no objects match the method name, return null

    let highestIdObject = filteredObjects[0]; // Initialize with the first object
    for (let obj of filteredObjects) {
        if (obj.txId > highestIdObject.txId) { // Check if current object has a higher id
            highestIdObject = obj;
        }
    }
    return highestIdObject; // Return the object with the highest id
  }

  function extractUserDetails(arrayOfData) {
    let connectedAddress = returnConnectedAddress();
    console.log("AlluserDetails", arrayOfData);
    console.log("test", String(arrayOfData[1].walletAddress) === String(connectedAddress));
    // console.log("test", arrayOfData[1].walletAddress);
    console.log("userADD", String(connectedAddress));
    let filteredData = arrayOfData.filter(data => (data.walletAddress).toLowerCase() === connectedAddress.toLowerCase());
    console.log("userDetails", filteredData);
    if (filteredData.length === 0){
      setUserData(null);
      return null; // If no objects match the method name, return null
    } 
    setUserData(filteredData[0]);
    return filteredData;
  }

    // Callback function to update noticeGenerated
    const handleNoticeGenerated = (noticePayload) => {
      let data = ethers.utils.toUtf8String(noticePayload)
      setNoticeGenerated(true)
      return data;
    };

    function returnConnectedAddress() {
      console.log("new address request:", connectedAddress);
      return connectedAddress;
    }

  const handleSubmit = (e) => {
    if (rollups === undefined) {
      alert ("Problem encountered creating profile, please reload your page and reconnect wallet");
    }
    e.preventDefault();
    setSubmitClicked(true);
    Input(rollups, dappAddress, functionParamsAsString, false);
    // alert("working....")
  };

//   Monika
// : 
// "NonnyJoe"
// NebulaTokenBalance
// : 
// 0
// characters
// : 
// []
// id
// : 
// 2
// nebulaBalance
// : 
// 0
// point
// : 
// 1000
// walletAddress
// :


  function fetchprofile(){
    console.log("connected adress in profike", returnConnectedAddress())
    console.log("profile")

    // const functionParamsAsString = JSON.stringify({
    //   method: "get_profile",
    // });
    // Input(rollups, dappAddress, functionParamsAsString, false);

  }


  useEffect(() => {
    fetchprofile();
  }
  ,[]);

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
            {/* {console.log(userData)} */}
            {/* {console.log(userData.Monika, userData.characters?.length, userData.point, userData.nebulaBalance)} */}
            {console.log("address is:", returnConnectedAddress())}
            <TeamCard
              img={"assets/img/team01.png"}
              name={userData ? userData.Monika : "UNREGISTERD USER"}
              title={userData ? cutWalletAddress(returnConnectedAddress()) : " "}
              noChar={userData ? userData.characters?.length : 0}
              gamePoints={userData ? userData.point : 0}
              nebBal={userData ? userData.nebulaBalance : 0}
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
