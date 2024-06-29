import React, { useState } from 'react';
import readGameState from '../../utils/readState';

interface PopupProps {
    winnerAddress: string;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ winnerAddress, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [duelWinner, setDuelWinner] = useState<string>(" ");

 const getUser = async () => {
     if (!isAnimating) {
         const {Status, request_payload: dPayload} = await readGameState(`profile/${winnerAddress}`);
         if (Status) {
             setDuelWinner(dPayload.monika);
             setIsAnimating(true);
            }
            
        }
}

getUser();  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className=" bg-slate-200 px-14 rounded-lg shadow-lg text-center border-4 border-green-600 py-14 shadow-slate-600">
        <h2 className="text-2xl font-bold font-belanosima text-green-800 mb-6">Battle Result</h2>
        <p className="text-lg font-barlow font-black text-black">Winner: {duelWinner}</p>
        <p className="text-lg font-barlow font-black text-black">Winner Address: {`${winnerAddress.slice(0, 8)}......${winnerAddress.slice(-8)}`}</p>
        <button
          className=" px-4 py-2 bg-green-800 text-white rounded hover:bg-green-600 mt-8"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
