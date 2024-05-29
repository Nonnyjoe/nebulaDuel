import React, { useEffect, useState } from "react";
import data from "./data";
import "./activeDuels.css";
import { Link } from "react-router-dom";
import Header from "../Components/header/Header";
import { useConnectedAddress } from "../ConnectedAddressContext";
import { useRollups } from "../useRollups";
import { ethers } from "ethers";
import getProfileDetails from "../utils/getProfileDetails";
import { GET_NOTICES, TNotice, useNotices } from "../useNotices";

const ActiveDuels = () => {
  const { connectedAddress } = useConnectedAddress();
  const [dappAddress, setDappAddress] = useState(
    "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"
  );
  const rollups = useRollups(dappAddress);
  const [noticeGenerated, setNoticeGenerated] = useState(false)
  const [allDuels, setAllDuels] = useState();


  async function fetchProfileNotices() {
    const [cursor, setCursor] = useState(null);
    const { loading, error, data } = useQuery(GET_NOTICES, {
      variables: { cursor },
      pollInterval: 500,
    });
    
    try {
      // const response = await fetch('http://localhost:8080/graphql', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     query: GET_NOTICES,
      //   }),
      // });
  
      // if (!response.ok) {
      //   throw new Error('Failed to fetch data');
      // }
  
      // let data = await response.json();
      data = data.data.notices.edges;
      // console.log('Data from GraphQL:', data);
      let JsonResponse = extractPayloadValues(data);
      let latesDuels = getObjectWithHighestId(JsonResponse, "all_duels");
      console.log("all Duels: ", latesDuels.data);
      let ActiveFilters = (latesDuels.data).filter(obj => Boolean(obj.isCompleted) === Boolean(false));
      
      setAllDuels(ActiveFilters);
      // setAllProfiles(latestProfiles.data);
      // let userData = extractUserDetails(latestProfiles.data);
      // console.log(`JsonResponse is:`, userData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
    useEffect(() => {
      const intervalId = setInterval(async () => {
        fetchProfileNotices();
      }, 20000); // Trigger every 20 seconds
    
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


    // Callback function to update noticeGenerated
    const handleNoticeGenerated = (noticePayload) => {
      let data = ethers.utils.toUtf8String(noticePayload)
      setNoticeGenerated(true)
      return data;
    };

   let getUserDetails = async(userAddress) => {
    console.log(`getUserDetails`, userAddress);
      let Userdata = await getProfileDetails(userAddress);
      console.log(`Userdata is:`, Userdata.Monika);
      return Userdata.Monika;
   }



  return (
    <div>
        <Header />
    <div className="duel-box">
      <div className="container-duel ">
        <h2>active duels</h2>
        <main className="card-container1">
        {allDuels ? allDuels.map((data) => (
          <Link to={`/duels/${data.duelId}`} key={data.duelId}>
          <div className="duelCard">
            <div className="img-wrapper">
            <img className="duel-img" src={'./assets/img/Rhyno.png'} alt="clone" />
            </div>
            <div className="text-wrapper">
              <h4>Duel ID</h4>
              <p className="duel-id">{data.duelId}</p>
            </div>
            <div className="text-wrapper">
              <h4>Stake</h4>
            <p className="duel-stake">${data.stake ? data.stake : 0}</p>
            </div>
            <div className="text-wrapper">
              <h4>Creator</h4>
            <InnerComponent userAddress={data.duelCreator} />
            </div>
          </div>
        </Link>
        )) : <div className="no_duel"> <p>Sorry, No Active Duel, at the moment...</p></div>}
        </main>
        
      </div>
    </div>
    </div>
  );
};


const InnerComponent = ({ userAddress }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let UserName = await getProfileDetails(userAddress);
        setUserData(UserName);
        console.log('User Name: ' + UserName);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData(); // Call the fetchData function when the component mounts
  }, [userAddress]); // Include userAddress in the dependency array to trigger fetch when it changes
  // console.log("tesingisdsda", userData);
  return (
    <p className="duel-creator"> 
      {userData?.Monika}
    </p>
  );
}

export default ActiveDuels;
