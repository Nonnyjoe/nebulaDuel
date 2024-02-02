import React, { useEffect, useState } from "react";
import "./Arena.css";
import characters from "./data"
import Header from "../../header/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useConnectedAddress } from "../../../ConnectedAddressContext";
import { useRollups } from "../../../useRollups";
import getDappAddress from "../../../utils/dappAddress";
import getCharacterDetails from "../../../utils/getCharacterDetails";
import { ethers } from "ethers";
import getProfileDetails from "../../../utils/getProfileDetails";
import { motion } from "framer-motion";

interface Character {
  id: number;
  name: string;
  img: string;
}

const Arena: React.FC = () => {
  const { duelId } = useParams();
  const [dappAddress, setDappAddress] = useState(
    "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"
  );
  const navigate = useNavigate();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Character[]>([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const { connectedAddress } = useConnectedAddress();
  const rollups = useRollups(getDappAddress());
  const [characterState, setCharacterSatate] = useState(null);
  const [allProfiles, setAllProfiles] = useState();
  const [userData, setUserData] =  useState<any>();
  const [creatorWarriors, setCreatorWarriors] = useState<any[]>();
  const [participantWarriors, setParticipantWarriors] = useState<any[]>();

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
        let latestProfiles = getObjectWithHighestId(JsonResponse, "all_duels");
        console.log("latestProfiles", latestProfiles);
        
        if (latestProfiles === null) {
          setCharacterSatate(null);
          return;
        }
        setCharacterSatate(latestProfiles);
        setAllProfiles(latestProfiles.data);
        let userData = extractUserDetails(latestProfiles.data);
        console.log(`JsonResponse is:`, userData[0]);
        let creatorWarriors = await getcharacterDetails(userData[0].creatorWarriors);
        let participantWarriors = await getcharacterDetails(userData[0].participantWarriors);

        setCreatorWarriors(creatorWarriors);
        setParticipantWarriors(participantWarriors);

        // console.log(`CreatorWarriors is:`, creatorWarriors);
        // console.log(`participantWarriors is:`, participantWarriors);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, 20000); // Trigger every 20 seconds
  
    return () => clearInterval(intervalId); // Clean up interval when component unmounts
  }, []);

  // Function to extract the payload and convert it to a json object
  function extractPayloadValues(arrayOfObjects : any[]) {
    let payloadValues = [];
    for (let obj of arrayOfObjects) {
        if ('node' in obj) {
            payloadValues.push(JSON.parse(handleNoticeGenerated(obj.node.payload)));
        }
    }
    // Return the array of payload values
    return payloadValues;
  }

  const handleNoticeGenerated = (noticePayload: any ) => {
    let data = ethers.utils.toUtf8String(noticePayload)
    // setNoticeGenerated(true)
    return data;
  };

  function getObjectWithHighestId(objects: any[] , methodName: string) {
    let filteredObjects = objects.filter(obj => obj.method === String(methodName));
    console.log("found", filteredObjects);
    if (filteredObjects.length === 0) return null; 

    let highestIdObject = filteredObjects[0]; 
    for (let obj of filteredObjects) {
        if (obj.txId > highestIdObject.txId) { 
            highestIdObject = obj;
        }
    }
    return highestIdObject; 
  }

  function extractUserDetails(arrayOfData : any[]): any {
    // console.log("AlluserDetails", arrayOfData);
    console.log("test", String(arrayOfData[1].owner) === String(connectedAddress));
  
    let filteredData = arrayOfData.filter(data => parseInt(data.duelId) === parseInt(duelId as string));
    console.log("userDetails", filteredData);
    if (filteredData.length === 0){
      setUserData(null);
      return null; // If no objects match the method name, return null
    } 
    setUserData(filteredData);
    return filteredData;
  }

  async function getcharacterDetails(characterIds: number[]) {
    let characterDetails = [];
    for (let i = 0; i < characterIds.length; i++) {
      let character = await getCharacterDetails(characterIds[i]);
      characterDetails.push(character);
    }
    // console.log("OKAYYYYYY", characterDetails);
    return characterDetails;
  }





function resolveImage(characterName: string) {
  switch (characterName) {
    case `Dragon`: return '../assets/img/Dragon.png';
    case `Godzilla`: return '../assets/img/Godzilla.png';
    case `Komodo`: return '../assets/img/komodo.png';
    case `KomodoDragon`: return '../assets/img/KomodoDragon.png';
    case `IceBeever`: return '../assets/img/IceBeever.png';
    case `Fox`: return '../assets/img/Fox.png';
    case `Hound`: return '../assets/img/Hound.png';
    case `Rhyno`: return '../assets/img/Rhyno.png';
    default: return '../assets/img/Dragon.png';
  }
}


  return (
    <div>
        <Header />
    <div className="arena-container">
      <div className="characters_container">
        <h3>Player 1 Characters</h3>
        <div><InnerComponent userAddress={creatorWarriors&&creatorWarriors[0]?.owner} /></div>
          <div className="character_list">
            {creatorWarriors?.map((character) => (
              <div key={character.id} className="c_character">
                <div className="C_image_container">
                  <img src={resolveImage(character.name)} alt={character.name} className="C_img" />
                </div>
                <div className="C_properties_container">
                  <p className="character_p c_name"> {character.name}</p>
                  <p className="character_p">HLT: {character.health}</p>
                  <p className="character_p">STR: {character.strength}</p>
                  <p className="character_p">ATK: {character.attack}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="field-container">
        <h1>Arena</h1>
        <div className="battlefield">
          {/* Display battlefield content here */}
          <div className="App">
      <motion.h1
        animate={{ x: [50, 150, 50], opacity: 1, scale: 1 }}
        transition={{
          duration: 5,
          delay: 0.3,
          ease: [0.5, 0.71, 1, 1.5],
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        whileHover={{ scale: 1.2 }}
      >
        Animation made easy with Framer Motion
      </motion.h1>
    </div>
        </div>
      </div>
      <div className="characters_container">
        <h3>Player 2 Characters</h3>
        <div><InnerComponent userAddress={participantWarriors&&participantWarriors[0]?.owner} /></div>
          <div className="character_list">
            {participantWarriors?.map((character) => (
              <div key={character.id} className="c_character">
                <div className="C_image_container">
                  <img src={resolveImage(character.name)} alt={character.name} className="C_img" />
                </div>
                <div className="C_properties_container">
                  <p className="character_p c_name"> {character.name}</p>
                  <p className="character_p">HLT: {character.health}</p>
                  <p className="character_p">STR: {character.strength}</p>
                  <p className="character_p">ATK: {character.attack}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
    </div>
  );
};

const InnerComponent = ({ userAddress }: any) => {
  const [userData, setUserData] = useState<any>();

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
  console.log("tesingisdsda", userData);
  return (
    <p className="duel-creator c_name"> 
      Player Name: {userData?.Monika}
    </p>
  );
}

export default Arena;
