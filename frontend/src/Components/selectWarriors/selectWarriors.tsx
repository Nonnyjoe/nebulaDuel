import React from "react";
import { useState } from "react";
import "./selectWarriors.css";
import characters from "../../Components/characters/data";
import { useNavigate } from "react-router-dom";
import Header from "../header/Header";
import { useRollups } from "../../useRollups";
import getDappAddress from "../../utils/dappAddress";
import { Input } from "../../utils/input";
import DuelCreatedModal from "./duelCreatedModal";

interface Character {
  id: number;
  name: string;
  img: string;
  price: number;

}


const SelectWarriors = () => {
const navigate = useNavigate();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  // const [totalCharacterPrice, setTotalCharacterPrice] = useState(Number);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [selectedCharactersId, setSelectedCharactersId] = useState<number[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);


  const rollups = useRollups(getDappAddress());

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
      return (
        <div className="emptyDiv">
        </div>
      )
  }

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
        <img src={character.img} alt={character.name} className="img" />
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
            <img src={character.img} alt={character.name} className="img" />
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
    }
    else {
      // submit transaction for signing.
      console.log(selectedCharacters);
      console.log(selectedCharactersId);
      console.log("Creating Duel......");
      // navigate("/SelectStrategy");

      //{"method": "create_duel", "selectedCharacters": [2, 1, 3]}
      const functionParamsAsString = JSON.stringify({
        method: "create_duel",
        selectedCharacters: [selectedCharactersId[0], selectedCharactersId[1], selectedCharactersId[2]]
      });

      if (rollups === undefined) {
        alert(
          "Problem encountered creating profile, please reload your page and reconnect wallet"
        );
      }

      setSubmitClicked(true);
      Input(rollups, getDappAddress(), functionParamsAsString, false);
      
      setTimeout(() => {
        setSelectedCharacters([ ]);
        setSelectedCharactersId([ ]);
        // setTotalCharacterPrice(0); 
        setIsModalOpen(true);
    }, 5000);
    }
  } 

  return (
    <div>
    <Header />
    <DuelCreatedModal isOpen={isModalOpen} onClose={handleCloseModal} />
    <div className="select-character-page">
      <h2>Choose your heros !!</h2>
      <div className="select-hero">
        <div className="allCharacters">
          <h3> Your Characters</h3>
          <div className="character-list">{characters.map(renderCharacter)}</div>
        </div>
        <div className="selected_characters">
          <h3> Selected Characters</h3>
          {selectedCharacters.length > 0 ? renderSelectedCharacters(): emptyDiv()}
          <button className="Create_Duel" onClick={handleCreateDuel}>Create Duel</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SelectWarriors;
