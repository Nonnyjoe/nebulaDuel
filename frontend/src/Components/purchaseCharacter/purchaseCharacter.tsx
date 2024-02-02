import React from "react";
import { useState,  useEffect} from "react";
import "./purchaseCharacters.css";
import characters from "../../Components/characters/data";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";
import { useRollups } from "../../useRollups";
import getDappAddress from "../../utils/dappAddress";
import { Input } from "../../utils/input";
import getProfileDetails from "../../utils/getProfileDetails";
import { useConnectedAddress } from "../../ConnectedAddressContext";

interface Character {
  id: number;
  name: string;
  img: string;
  price: number;
}

const PurchaseCharacter = () => {
  const navigate = useNavigate();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [totalCharacterPrice, setTotalCharacterPrice] = useState(Number);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [selectedCharactersId, setSelectedCharactersId] = useState<number[]>(
    []
  );
  const rollups = useRollups(getDappAddress());
  const { connectedAddress } = useConnectedAddress();

  const toggleCharacterSelection = (character: Character) => {
    const index = selectedCharacters.findIndex((c) => c.id === character.id);
    if (index === -1) {
      if (selectedCharacters.length < 3) {
        setSelectedCharacters([...selectedCharacters, character]);
        setSelectedCharactersId([...selectedCharactersId, character.id]);
        setTotalCharacterPrice(character.price + totalCharacterPrice);
      } else {
        alert("You can select only 3 characters.");
      }
    } else {
      const updatedCharacters = [...selectedCharacters];
      const updatedCharactersId = [...selectedCharactersId];
      updatedCharacters.splice(index, 1);
      updatedCharactersId.splice(index, 1);

      setSelectedCharacters(updatedCharacters);
      setSelectedCharactersId(updatedCharactersId);
      setTotalCharacterPrice(totalCharacterPrice - character.price);
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
        className={`character_card_pur ${isSelected ? "selected" : ""}`}
        onClick={() => toggleCharacterSelection(character)}
      >
        <img src={character.img} alt={character.name} className="img" />
        <p className="characterNamePur">{character.name}</p>
        <p className="character_pur pur_price">
          Price: {character.price} Points
        </p>
        <div className="flex-row character_data_pur">
          <div>
            <p className="character_pur">Health: {character.health}</p>
            <p className="character_pur">Strength: {character.strength}</p>
          </div>
          <div>
            <p className="character_pur">Attack: {character.attack}</p>
            <p className="character_pur">Speed: {character.speed}</p>
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
            <img src={character.img} alt={character.name} className="img" />
            <p>{character.name}</p>
          </div>
        ))}
      </div>
    );
  };

  const handlePurchaseCharacter = (e: any) => {
    e.preventDefault();

    const functionParamsAsString = JSON.stringify({
      method: "create_team",
      char1: selectedCharactersId[0],
      char2: selectedCharactersId[1],
      char3: selectedCharactersId[2],
    });

    // while (selectedCharacters.length > 0) {
    //     toggleCharacterSelection(selectedCharacters[0]);
    // }
    
    setTimeout(() => {
        setSelectedCharacters([ ]);
        setSelectedCharactersId([ ]);
        setTotalCharacterPrice(0); 
    }, 5000);

 


    if (selectedCharacters.length < 3) {
      alert("Please select minimum of 3 characters");
    } else {
      if (rollups === undefined) {
        alert(
          "Problem encountered creating profile, please reload your page and reconnect wallet"
        );
      }
      e.preventDefault();
      setSubmitClicked(true);
      Input(rollups, getDappAddress(), functionParamsAsString, false);
    }

  };

  return (
    <div>
      <Header />
      <div className="purchase-character-page">
        <h2>Select characters to Purchase!!</h2>
        <div className="select-hero">
          <div className="allCharacters">
            <h3> All Characters</h3>
            <div className="character-list">
              {characters.map(renderCharacter)}
            </div>
          </div>
          <div className="selected_characters">
            <h3> Selected Characters</h3>
            {selectedCharacters.length > 0
              ? renderSelectedCharacters()
              : emptyDiv()}
            <div>
              <h4 className="total_pur_price">
                Total Price: {totalCharacterPrice} Points
              </h4>
              <h4 className="total_pur_price">
              <InnerComponent userAddress={connectedAddress} />
              </h4>
            </div>
            <button className="Create_Duel" onClick={handlePurchaseCharacter}>
              Purchase Characters
            </button>
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
  // console.log("tesingisdsda", userData);
  return (
    <p className="duel-creator c_name"> 
      Your Point Bal: {userData?.point} Points
    </p>
  );
}

export default PurchaseCharacter;
