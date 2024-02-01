import React from "react";
import { useState } from "react";
import "./selectWarriors.css";
import characters from "./data";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../header/Header";
import { useRollups } from "../../../useRollups";
import getDappAddress from "../../../utils/dappAddress";
import { Input } from "../../../utils/input";

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


const SelectWarriorsDynamic = () => {
const { duelId } = useParams();
const navigate = useNavigate();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
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

  const handleJoinDuel = (e: any) => {
    e.preventDefault();
    if (selectedCharacters.length < 3) {
        alert("Please select minimum of 3 characters");
    }
    else {
      // submit transaction for signing.
      console.log(`duelId is: ${duelId}`);
      console.log(selectedCharacters);
      console.log(selectedCharactersId);
      console.log("Creating Duel......");
      
      //{"method": "create_duel", "selectedCharacters": [2, 1, 3]}
      const functionParamsAsString = JSON.stringify({
        method: "join_duel",
        duelId: Number(parseInt(duelId as string)),
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
        // setIsModalOpen(true);
        navigate(`/setStrategy/${duelId}`)
    }, 5000);

    }
  } 

  return (
    <div>
    <Header />
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
          <button className="Create_Duel" onClick={handleJoinDuel}>Join Duel</button>
        </div>
      </div>
    </div>
    </div>

  );
};

export default SelectWarriorsDynamic;
