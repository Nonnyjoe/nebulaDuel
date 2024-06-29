import React  from 'react';
import {  useNavigate } from 'react-router-dom';
// import Header from './Header';
import "./activeDuels.css";
import { useActiveAccount } from "thirdweb/react";
import readGameState from '../../utils/readState';


// Define the ProfileData type
interface ProfileData {
  monika: string;
  wallet_address: string;
  avatar_url: string;
  characters: string;
  id: number;
  cartesi_token_balance: number;
  // Add other properties if needed
}

interface DisplayDataProps {
  duel_id: number;
  duel_creator: string;
  creation_time: number;
  stake_amount: number;
  allPlayers: ProfileData[];
  duel_opponent: string;
  creators_strategy: string;
  opponent_strategy: string;
  is_completed: boolean;
  difficulty: string;
}

const DuelCard: React.FC<DisplayDataProps> = ({duel_id, duel_creator, creation_time, stake_amount, allPlayers, duel_opponent, creators_strategy, opponent_strategy, is_completed, difficulty}) => {
  // const data = duelData; 
  // console.log("Data obtained..........." + JSON.stringify(data));
  let creator = "";
  let creators_uri = ""
  const activeAccount = (useActiveAccount()?.address)?.toLowerCase();
  const navigate = useNavigate();
  for (let i = 0; i < allPlayers?.length; i++) {
    if ((allPlayers[i].wallet_address).toLowerCase() === duel_creator.toLowerCase()) {
      // console.log("Found the creator", allPlayers[i]);
      creator = allPlayers[i].monika;
      creators_uri = allPlayers[i].avatar_url;
    }
  }

  

  async function decideRoute(): Promise<string> {
    try {
      if ( difficulty != "P2P") {
        const { request_payload} = await readGameState(`duels/${duel_id}`);
        const is_completed = request_payload.is_completed
        console.log("is_completed", request_payload);
        if (is_completed) {
          return `/duels/${duel_id}`;
        }
      }
    } catch (err) {
      console.log("Error", err);
    }

    if ((activeAccount == duel_creator || activeAccount == duel_opponent) && creators_strategy != "Yet_to_select" &&  opponent_strategy != "Yet_to_select" && is_completed == false) {
      return `/duels/${duel_id}`;
    } else if ((activeAccount == duel_creator || activeAccount == duel_opponent) && (creators_strategy == "Yet_to_select" || opponent_strategy == "Yet_to_select")) {
      return `/strategy/${duel_id}`;
    } else if (duel_opponent == "" && activeAccount != duel_creator) {
      return `/joinduel/${duel_id}`;
    } else if (is_completed) {
      return `/duels/${duel_id}`;
    } 
    return `/duels/${duel_id}`
  }

  function convertTimestampToReadableTime(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
  
    return date.toLocaleDateString('en-US', options);
  }


  const handleDuelClicked = async () => {
    console.log("Duel Card clicked: ", duel_id);
    navigate(await decideRoute());
  }

  return (
    <div className=' my-10 w-[70%] mx-auto' onClick={handleDuelClicked}>
        {/* <Link to={decideRoute()} key={duel_id}> */}
          <div className="duelCard">
            <div className="img-wrapper">
            <img className="duel-img" src={ creators_uri ? creators_uri : '../../../public/nebula-characters/techno-no.gif'} alt="clone" />
            </div>
            <div className="text-wrapper">
              <h4  className=' font-belanosima'>Creator</h4>
            <p className="duel-stake">{creator}</p>
            </div>
            <div className="text-wrapper">
              <h4 className=' font-belanosima'>Duel ID</h4>
              <p className="duel-id">{duel_id}</p>
            </div>
            <div className="text-wrapper">
              <h4 className=' font-belanosima'>Stake</h4>
            <p className="duel-stake">${stake_amount ? stake_amount : 0}</p>
            </div>
            <div className="text-wrapper">
              <h4  className=' font-belanosima'>Time Created</h4>
            <p className="duel-stake">{convertTimestampToReadableTime(creation_time)}</p>
            </div>
          </div>
        {/* </Link> */}
    </div>
  );
};

export default DuelCard;
