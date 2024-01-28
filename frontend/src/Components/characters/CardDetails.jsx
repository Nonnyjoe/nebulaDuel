import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import data from './data';
import { GiLifeBar } from "react-icons/gi";
import { MdHealthAndSafety } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";
import { TbTrophyOff } from "react-icons/tb";
import { IoSpeedometer } from "react-icons/io5";
import { GiSwitchWeapon } from "react-icons/gi";
import { RiMoneyDollarCircleFill } from "react-icons/ri";

const CardDetails = () => {
  const { profileId } = useParams();
  const [cardDetails, setCardDetails] = useState(null);

  useEffect(() => {
    const selectedCard = data.find((card) => card.id.toString() === profileId);
    setCardDetails(selectedCard);
  }, [profileId]);

  if (!cardDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <section className='player-bio'>
            <div className='game-container'>
            <h2 className='name'>Player: {cardDetails.name}</h2>
            <p className='greenText'>{cardDetails.superPower}</p>       
            <div className='gameCard'>
            <div className='health'>
            <h3>Health check</h3>
            <p><MdHealthAndSafety className='icon' /> Health: {cardDetails.health}</p>
            <p><GiLifeBar className='icon' /> Strength: {cardDetails.strength}</p>
            <p><GiSwitchWeapon className='icon' /> Attack: {cardDetails.attack}</p>
            <p><IoSpeedometer className='icon' /> Speed: {cardDetails.speed}</p>
            </div>
            <div className='score'>
            <h3>Score board</h3>
            <p><FaTrophy className='icon' /> Total wins: {cardDetails.totalWins}</p>
            <p><TbTrophyOff className='icon' /> Total loss: {cardDetails.totalLoss}</p>
            <p><RiMoneyDollarCircleFill className='icon' /> Price: ${cardDetails.price}</p>
            </div>
            </div>
            </div>
            <img src={cardDetails.img} alt={cardDetails.name} />
        </section>
    
        
    </div>
  );
};

export default CardDetails;
