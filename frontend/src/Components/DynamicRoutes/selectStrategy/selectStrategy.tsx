import React, { useEffect } from "react";
import { useState } from "react";
import "./selectStrategyDynamic.css";
import characters from "./data";
import { useNavigate, useParams } from "react-router-dom";
import strategy from "./strategyData.js";
import { useRollups } from "../../../useRollups";
import Header from "../../header/Header";
import { Input } from "../../../utils/input";
import { ethers } from "ethers";
import { useConnectedAddress } from "../../../ConnectedAddressContext";
import getDappAddress from "../../../utils/dappAddress";
import getCharacterDetails from "../../../utils/getCharacterDetails";
import { MdHealthAndSafety } from "react-icons/md";
import { GiSwitchWeapon } from "react-icons/gi";
import getProfileDetails from "../../../utils/getProfileDetails";

interface Character {
  id: number;
  name: string;
  img: string;
}

// const characters: Character[] = [
//   { id: 1, name: 'Character 1', image: '/frontend/Game_Characters/Dragon.png' },
//   { id: 2, name: 'Character 2', image: 'character2.jpg' },
//   { id: 3, name: 'Character 3', image: 'character3.jpg' },
//   // Add more characters as needed
// ];

const SelectStrategyDynamic = () => {
const { duelId } = useParams();
  const [dappAddress, setDappAddress] = useState(
    "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"
  );
  const navigate = useNavigate();
  // const [duelId, setDuelId] = useState(1);
  // strategy is already used as variable name, throws error
  // const [strategi, setStrategi] = useState(1);
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


  const toggleCharacterSelection = (character: Character) => {
    const index = selectedCharacters.findIndex((c) => c.id === character.id);
    if (index === -1) {
      if (selectedCharacters.length < 3) {
        setSelectedCharacters([...selectedCharacters, character]);
      } else {
        alert("You can select only 3 characters.");
      }
    } else {
      const updatedCharacters = [...selectedCharacters];
      updatedCharacters.splice(index, 1);
      setSelectedCharacters(updatedCharacters);
    }
  };

  const toggleStrategySelection = (strategy: any) => {
    const index = selectedStrategy.findIndex((c) => c.id === strategy.id);
    if (index === -1) {
      if (selectedStrategy.length < 1) {
        setSelectedStrategy([...selectedStrategy, strategy]);
      } else {
        alert("You can select only 1 Strategy.");
      }
    } else {
      const updatedStrategy = [...selectedStrategy];
      updatedStrategy.splice(index, 1);
      setSelectedStrategy(updatedStrategy);

      // setSubmitClicked(true);
      // Input(rollups, dappAddress, functionParamsAsString, false);
    }
  };

  const emptyDiv = () => {
    return <div className="emptyDiv"></div>;
  };

  const renderCharacter = (character: any) => {
    const isSelected = selectedCharacters.some((c) => c.id === character.id);
    return (
      <div
        key={character.id}
        className={`character ${isSelected ? "selected" : ""}`}
      >
        <img src={resolveImage(character.name)} alt={character.name} className="img" />
        <p className="characterName">{character.name}</p>
        <div className="flex-row character_data">
          <div>
            <p className="character_p">Health: {character.health}</p>
            <p className="character_p">Strength: {character.strength}</p>
          </div>
          <div>
            <p className="character_p">Attack: {character.attack}</p>
            <p className="character_p">Speed: {character.speed}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderStrategy = (strategy: any) => {
    const isSelected = selectedStrategy.some((c) => c.id === strategy.id);
    return (
      <div
        key={strategy.id}
        className={`strategy ${isSelected ? "selected" : ""}`}
        onClick={() => toggleStrategySelection(strategy)}
      > 
      <div>
        {strategy.code === 'M2LH' || strategy.code === 'L2MH' ? <MdHealthAndSafety className='icon' /> : <GiSwitchWeapon className='icon' />}
      </div>
        <p className="strategyName">{strategy.name}</p>
        {/* <div className="flex-row Strategy_data">
            <p className="strategy_code">Code: {strategy.code}</p>
        </div> */}
      </div>
    );
  };

  const renderSelectedCharacters = () => {
    return (
      <div className="selected-characters-data">
        {selectedCharacters.map((character) => (
          <div key={character.id} className="selected-character">
            <img src={resolveImage(character.name)} alt={character.name} className="img" />
            <p>{character.name}</p>
          </div>
        ))}
      </div>
    );
  };

  const handleSelectStrategy = (e: any) => {
    e.preventDefault();
    if (selectedStrategy.length < 1) {
      alert("Please select at least 1 strategy");
    } else {
      // submit transaction for signing.
      console.log(selectedStrategy);
      console.log("Registering Strategy......");
      
      const functionParamsAsString = JSON.stringify({
        method: "set_strategy",
        duelId: Number(parseInt(duelId as string)),
        strategy: selectedStrategy[0].id,
      });

      setSubmitClicked(true);
      Input(rollups, dappAddress, functionParamsAsString, false);

      setTimeout(() => {
        // setTotalCharacterPrice(0); 
        // setIsModalOpen(true);
        navigate(`/arena/${duelId}`);
    }, 5000);
    }
  };

  return (
    <div>
        <Header />
      <div className="select-character-page">
        <h2>Select Your Strategy !!</h2>
        <div className="select-hero">
          <div className="allCharacters">
            <h3> Player 1 Warriors</h3>
            <InnerComponent userAddress={creatorWarriors&&creatorWarriors[0]?.owner} />
            <div className="character-list">
              {creatorWarriors?.map(renderCharacter)}
            </div>
          </div>
          <div className="selected_characters">
            <h3>Player 2 Warriors</h3>
            <InnerComponent userAddress={participantWarriors&&participantWarriors[0]?.owner} />

            <div className="character-list">
              {participantWarriors?.map(renderCharacter)}
            </div>
            {/* <h3 Select Attack Strategy</h3>
          {selectedCharacters.length > 0 ? renderSelectedCharacters(): emptyDiv()}
          <button className="Create_Duel" onClick={handleCreateDuel}>Create Duel</button> */}
          </div>
        </div>
        <div className="centred">
          <h3> Select Attack Strategy</h3>
          <div className="strategy_list">{strategy.map(renderStrategy)}</div>
          <button className="Create_Duel" onClick={handleSelectStrategy}>
            Set Strategy
          </button>
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
  // console.log("tesingisdsda", userData);
  return (
    <p className="duel-creator c_name"> 
      Player Name: {userData?.Monika}
    </p>
  );
}

export default SelectStrategyDynamic;