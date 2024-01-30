import React from "react";
import { useState } from "react";
import "./selectWarriors.css";
import characters from "../../Components/characters/data";
import { useNavigate } from "react-router-dom";

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

const SelectWarriors = () => {
const navigate = useNavigate();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);

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

  const handleCreateDuel = (e: any) => {
    e.preventDefault();
    if (selectedCharacters.length < 3) {
        alert("Please select minimum of 3 characters");
    }
    else {
      // submit transaction for signing.
      console.log(selectedCharacters);
      console.log("Creating Duel......");
      navigate("/SelectStrategy");
    }
  } 

  return (
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
  );
};

export default SelectWarriors;
