import React from "react";
import "./Arena.css";
import characters from "./data"

const Arena: React.FC = () => {
  return (
    <div className="arena-container">
      <div className="characters_container">
        <h3>Your Characters</h3>
          <div className="character_list">
            {characters.map((character) => (
              <div key={character.id} className="c_character">
                <div className="C_image_container">
                  <img src={character.img} alt={character.name} className="C_img" />
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
        </div>
      </div>
      <div className="characters_container">
        <h3>Opponent Characters</h3>
          <div className="character_list">
            {characters.map((character) => (
              <div key={character.id} className="c_character">
                <div className="C_image_container">
                  <img src={character.img} alt={character.name} className="C_img" />
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
  );
};

export default Arena;
