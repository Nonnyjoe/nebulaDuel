import React, { useState, useEffect } from 'react';

type AnimationStep = {
  from: string;
  to: string;
};


type Warrior = {
  char_id: number;
};

type Duel = {
  duel_id: number;
  is_active: boolean;
  is_completed: boolean;
  has_stake: boolean;
  stake_amount: number;
  difficulty: string;
  duel_creator: string;
  creator_warriors: string; // JSON string of Warrior[]
  creators_strategy: string;
  duel_opponent: string;
  opponent_warriors: string; // JSON string of Warrior[]
  opponents_strategy: string;
  battle_log: string; // JSON string of steps
  duel_winner: string;
  duel_loser: string;
  creation_time: number;
};

type Props = {
  duel: Duel;
};

const GameLayout: React.FC<Props> = ({ duel }) => {

  const creatorWarriors: Warrior[] = JSON.parse(duel.creator_warriors);
  const opponentWarriors: Warrior[] = JSON.parse(duel.opponent_warriors);
  console.log("Battle Log:", JSON.parse(duel.battle_log));
  const battleLog: AnimationStep[] = JSON.parse(JSON.stringify(duel.battle_log));
  //  console.log(JSON.parse(battleLog), "checking length of battle")
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentStep < battleLog.length && !isAnimating) {
      setIsAnimating(true);
      const { from, to } = battleLog[currentStep];

      const fromElement = document.getElementById(`warrior-${from}`);
      const toElement = document.getElementById(`warrior-${to}`);

      if (fromElement && toElement) {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();

        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;

        fromElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        fromElement.style.transition = 'transform 1s';

        setTimeout(() => {
          fromElement.style.transform = '';
          fromElement.style.transition = 'transform 1s';

          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
            setIsAnimating(false);
          }, 1000);
        }, 1000);
      }
    }
  }, [currentStep, isAnimating, battleLog]);

  return (
    <div className="flex justify-between items-center h-screen p-8 border-2 border-black">
      <div className="flex flex-col gap-8">
        {creatorWarriors.map(warrior => (
          <div key={warrior.char_id} id={`warrior-${warrior.char_id}`} className="w-32 h-32 border-4 border-blue-500 flex items-center justify-center text-2xl text-white">
            {warrior.char_id}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-8">
        {opponentWarriors.map(warrior => (
          <div key={warrior.char_id} id={`warrior-${warrior.char_id}`} className="w-32 h-32 border-4 border-green-500 flex items-center justify-center text-2xl text-white">
            {warrior.char_id}
          </div>
        ))}
      </div>
    </div>
  );
};


export default GameLayout