import React from "react";
import { useState } from "react";
import "./selectStrategy.css";
import characters from "./data";
import { useNavigate } from "react-router-dom";
import strategy from "./strategyData.js";
import Header from "../header/Header";
import { useRollups } from "../../useRollups";
import { Input } from "../../utils/input";

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

const SelectStrategy = () => {
  const [dappAddress, setDappAddress] = useState(
    "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C"
  );
  const navigate = useNavigate();
  const [duelId, setDuelId] = useState(1);
  // strategy is already used as variable name, throws error
  const [strategi, setStrategi] = useState(1);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Character[]>([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const rollups = useRollups(dappAddress);

  const functionParamsAsString = JSON.stringify({
    method: "set_strategy",
    duelId: duelId,
    strategy: strategi,
  });

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

  const renderStrategy = (strategy: any) => {
    const isSelected = selectedStrategy.some((c) => c.id === strategy.id);
    return (
      <div
        key={strategy.id}
        className={`strategy ${isSelected ? "selected" : ""}`}
        onClick={() => toggleStrategySelection(strategy)}
      >
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
            <img src={character.img} alt={character.name} className="img" />
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
      
      setSubmitClicked(true);
      Input(rollups, dappAddress, functionParamsAsString, false);
      navigate("/Arena");
    }
  };

  return (
    <div>
        <Header />
      <div className="select-character-page">
        <h2>Select Your Strategy !!</h2>
        <div className="select-hero">
          <div className="allCharacters">
            <h3> Oponents Warriors</h3>
            <div className="character-list">
              {characters.map(renderCharacter)}
            </div>
          </div>
          <div className="selected_characters">
            <h3>Your Warriors</h3>
            <div className="character-list">
              {characters.map(renderCharacter)}
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

export default SelectStrategy;
