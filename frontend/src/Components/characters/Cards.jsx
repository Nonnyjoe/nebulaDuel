import React from 'react';
import { useState, useEffect } from 'react';
import data from './data'
import Swipercore from "swiper"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination , Navigation, Autoplay } from 'swiper/modules';
import { Link } from "react-router-dom";
import './characters.css';
import { useRollups } from "../../useRollups";
import {useConnectedAddress} from "../../ConnectedAddressContext";
import { ethers } from "ethers";
import { GET_NOTICES, useNotices, TNotice } from '../../useNotices';
Swipercore.use([Autoplay, Navigation])

const Cards = () => {
  const [dappAddress, setDappAddress] = useState("0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C");
  const rollups = useRollups(dappAddress);
  const [noticeGenerated, setNoticeGenerated] = useState(false)
  const [allProfiles, setAllProfiles] = useState("");
  const [userData, setUserData] = useState();
  const [characterState, setCharacterSatate] = useState(null);
  const { connectedAddress } = useConnectedAddress();



  const breakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    820: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 30,
    },
  };


  async function fetchProfileNotices() {
    const [cursor, setCursor] = useState(null);
    const { loading, error, data } = useQuery(GET_NOTICES, {
      variables: { cursor },
      pollInterval: 500,
    });
    try {
      data = data.data.notices.edges;
      // console.log('Data from GraphQL:', data);
      let JsonResponse = extractPayloadValues(data);
      let latestProfiles = getObjectWithHighestId(JsonResponse, "all_character");
      if (latestProfiles === null || latestProfiles === undefined) {
        setCharacterSatate(null);
        return;
      }

      setCharacterSatate(latestProfiles);
      setAllProfiles(latestProfiles.data);
      let userData = extractUserDetails(latestProfiles.data);
      console.log("user data", userData)
      console.log(`JsonResponse is:`, userData);
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
  
    function extractUserDetails(arrayOfData) {
      console.log("AlluserDetails", arrayOfData);
      console.log("test result is", String(arrayOfData[0].owner) === String(connectedAddress));
      // console.log("test", arrayOfData[1].walletAddress);
      console.log("userADD", String(connectedAddress));
      let filteredData = arrayOfData.filter(data => (data.owner).toLowerCase() === connectedAddress.toLowerCase());
      console.log("userDetails", filteredData);
      if (filteredData.length === 0){
        setUserData(null);
        return null; // If no objects match the method name, return null
      } 
      setUserData(filteredData);
      return filteredData;
    }
  
  
      // Callback function to update noticeGenerated
      const handleNoticeGenerated = (noticePayload) => {
        let data = ethers.utils.toUtf8String(noticePayload)
        setNoticeGenerated(true)
        return data;
      };



      function resolveImage(characterName) {
        switch (characterName) {
          case `Dragon`: return './assets/img/Dragon.png';
          case `Godzilla`: return './assets/img/Godzilla.png';
          case `Komodo`: return './assets/img/komodo.png';
          case `KomodoDragon`: return './assets/img/KomodoDragon.png';
          case `IceBeever`: return './assets/img/IceBeever.png';
          case `Fox`: return './assets/img/Fox.png';
          case `Hound`: return './assets/img/Hound.png';
          case `Rhyno`: return './assets/img/Rhyno.png';
          default: return './assets/img/Dragon.png';
        }
      }
      

  return (
    <div className='card-container'>   
        <h2>All Your Characters</h2>

        <Swiper
        slidesPerView={4}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        breakpoints={breakpoints}
        className="mySwiper">
          {characterState === null ? "Kindly buy characters" : userData.map(info => (
            <SwiperSlide key={info.id}>
            <Link key={info.id} to={`/${info.id}`} className='linkStyle'>
            <div style={{ backgroundImage: `url(${resolveImage(info.name)})` }} className='card'>
              <div className='overlay'></div>
            <h3 className='name'>{info.name}</h3>
            </div>
        </Link>
        </SwiperSlide>
          ))}
          <br />
          <br />
          <br />
          <br />
            </Swiper> 
    </div>
  )
}

export default Cards;