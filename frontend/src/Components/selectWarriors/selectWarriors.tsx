import React from "react";
import { useState, useEffect } from "react";
import "./selectWarriors.css";
import characters from "../../Components/characters/data";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";
import { useRollups } from "../../useRollups";
import getDappAddress from "../../utils/dappAddress";
import { Input } from "../../utils/input";
import DuelCreatedModal from "./duelCreatedModal";
import { useConnectedAddress } from "../../ConnectedAddressContext";
import { ethers } from "ethers";
import { GET_NOTICES, useNotices, TNotice } from "../../useNotices";
import { useQuery } from "@apollo/client";

interface Character {
  id: number;
  name: string;
  img: string;
  price: number;
}

const SelectWarriors = () => {
  const navigate = useNavigate();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const { connectedAddress } = useConnectedAddress();
  // const [totalCharacterPrice, setTotalCharacterPrice] = useState(Number);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [selectedCharactersId, setSelectedCharactersId] = useState<number[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProfiles, setAllProfiles] = useState("");
  const [userData, setUserData] = useState<any>();
  const [noticeGenerated, setNoticeGenerated] = useState(false);
  const [characterState, setCharacterSatate] = useState(null);

  const rollups = useRollups(getDappAddress());

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const [cursor, setCursor] = useState(null);
      const { loading, error, data } = useQuery(GET_NOTICES, {
        variables: { cursor },
        pollInterval: 500,
      });
      try {

        let fetchData = data.data.notices.edges;
        // console.log('Data from GraphQL:', data);
        let JsonResponse = extractPayloadValues(fetchData);
        let latestProfiles = getObjectWithHighestId(
          JsonResponse,
          "all_character"
        );
        console.log("latestProfiles", latestProfiles);

        if (latestProfiles === null) {
          setCharacterSatate(null);
          return;
        }

        setCharacterSatate(latestProfiles);
        setAllProfiles(latestProfiles.data);
        let userData = extractUserDetails(latestProfiles.data);
        console.log(`JsonResponse is:`, userData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, 2000); // Trigger every 20 seconds

    return () => clearInterval(intervalId); // Clean up interval when component unmounts
  }, []);

  // Function to extract the payload and convert it to a json object
  function extractPayloadValues(arrayOfObjects: any[]) {
    let payloadValues = [];
    for (let obj of arrayOfObjects) {
      if ("node" in obj) {
        payloadValues.push(JSON.parse(handleNoticeGenerated(obj.node.payload)));
      }
    }
    // Return the array of payload values
    return payloadValues;
  }

  function getObjectWithHighestId(objects: any[], methodName: string) {
    let filteredObjects = objects.filter(
      (obj) => obj.method === String(methodName)
    );
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

  function extractUserDetails(arrayOfData: any[]) {
    console.log("AlluserDetails", arrayOfData);
    console.log(
      "test",
      String(arrayOfData[1].owner) === String(connectedAddress)
    );

    let filteredData = arrayOfData.filter(
      (data) => data.owner.toLowerCase() === connectedAddress.toLowerCase()
    );
    console.log("userDetails", filteredData);
    if (filteredData.length === 0) {
      setUserData(null);
      return null; // If no objects match the method name, return null
    }
    setUserData(filteredData);
    return filteredData;
  }

  const handleNoticeGenerated = (noticePayload: any) => {
    let data = ethers.utils.toUtf8String(noticePayload);
    setNoticeGenerated(true);
    return data;
  };

  function resolveImage(characterName: string) {
    switch (characterName) {
      case `Dragon`:
        return "./assets/img/Dragon.png";
      case `Godzilla`:
        return "./assets/img/Godzilla.png";
      case `Komodo`:
        return "./assets/img/komodo.png";
      case `KomodoDragon`:
        return "./assets/img/KomodoDragon.png";
      case `IceBeever`:
        return "./assets/img/IceBeever.png";
      case `Fox`:
        return "./assets/img/Fox.png";
      case `Hound`:
        return "./assets/img/Hound.png";
      case `Rhyno`:
        return "./assets/img/Rhyno.png";
      default:
        return "./assets/img/Dragon.png";
    }
  }

  const toggleCharacterSelection = (character: Character) => {
    const index = selectedCharacters.findIndex((c) => c.id === character.id);
    if (index === -1) {
      if (selectedCharacters.length < 3) {
        setSelectedCharacters([...selectedCharacters, character]);
        setSelectedCharactersId([...selectedCharactersId, character.id]);
        // setTotalCharacterPrice(character.price + totalCharacterPrice);
      } else {
        alert("You can select only 3 characters.");
      }
    } else {
      const updatedCharacters = [...selectedCharacters];
      const updatedCharactersId = [...selectedCharactersId];
      updatedCharactersId.splice(index, 1);
      updatedCharacters.splice(index, 1);

      setSelectedCharacters(updatedCharacters);
      setSelectedCharactersId(updatedCharactersId);
      // setTotalCharacterPrice(totalCharacterPrice - character.price);
    }
  };

  const emptyDiv = () => {
    return <div className="emptyDiv"></div>;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderCharacter = (character: any) => {
    const isSelected = selectedCharacters.some((c) => c.id === character.id);
    return (
      <div
        key={character.id}
        className={`character ${isSelected ? "selected" : ""}`}
        onClick={() => toggleCharacterSelection(character)}
      >
        <img
          src={resolveImage(character.name)}
          alt={character.name}
          className="img"
        />
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

  const renderSelectedCharacters = () => {
    return (
      <div className="selected-characters-data">
        {selectedCharacters.map((character) => (
          <div key={character.id} className="selected-character">
            <img
              src={resolveImage(character.name)}
              alt={character.name}
              className="img"
            />
            <p>{character.name}</p>
          </div>
        ))}
      </div>
    );
  };

  const handleCreateDuel = (e: any) => {
    e.preventDefault();
    if (selectedCharacters.length < 3) {
      alert("Please select minimum of 3 characters");
    } else {
      // submit transaction for signing.
      console.log(selectedCharacters);
      console.log(selectedCharactersId);
      console.log("Creating Duel......");
      // navigate("/SelectStrategy");

      //{"method": "create_duel", "selectedCharacters": [2, 1, 3]}
      const functionParamsAsString = JSON.stringify({
        method: "create_duel",
        selectedCharacters: [
          selectedCharactersId[0],
          selectedCharactersId[1],
          selectedCharactersId[2],
        ],
      });

      if (rollups === undefined) {
        alert(
          "Problem encountered creating profile, please reload your page and reconnect wallet"
        );
      }

      setSubmitClicked(true);
      Input(rollups, getDappAddress(), functionParamsAsString, false);

      setTimeout(() => {
        setSelectedCharacters([]);
        setSelectedCharactersId([]);
        // setTotalCharacterPrice(0);
        setIsModalOpen(true);
      }, 5000);
    }
  };

  return (
    <div>
      <Header />
      <DuelCreatedModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <div className="select-character-page">
        <h2>Choose your heros !!</h2>
        <div className="select-hero">
          <div className="allCharacters">
            <h3> Your Characters</h3>

            <div className="character-list">
              {characterState === null
                ? "Go to profile page and buy characters"
                : userData?.map(renderCharacter)}
            </div>
          </div>
          <div className="selected_characters">
            <h3> Selected Characters</h3>
            {selectedCharacters.length > 0
              ? renderSelectedCharacters()
              : emptyDiv()}
            <button className="Create_Duel" onClick={handleCreateDuel}>
              Create Duel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectWarriors;
