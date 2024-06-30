import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import * as THREE from "three"
// import { demoLog2 } from './BattleData';
// import fetchNotices from '../../utils/readSubgraph';
// import { useActiveAccount } from 'thirdweb/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import charactersdata from '../../utils/Charactersdata';
import readGameState from '../../utils/readState';
import { Canvas } from '@react-three/fiber';
// import { Suspense } from 'react';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useAnimations, useGLTF } from '@react-three/drei';
import { Html, useProgress } from '@react-three/drei'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js';
// import { triNoise3D } from 'three/examples/jsm/nodes/Nodes.js';
import { ImageWrap } from '../atom/ImageWrap';
// import charactersdata from '../../utils/Charactersdata';
import Popup from './Popup';
// import { useFrame } from '@react-three/fiber';

type BattleLogStep = [number, number];


// console.log("Battle Log:", JSON.parse(demoLog));

interface CharacterDetails {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  owner: string;
  price: number;
  super_power: string;
  total_battles: number;
  total_losses: number;
  total_wins: number;
  img: string;
  model: string;
  animiation_code: number;
}



interface CharacterModelProps {
  modelPath: string;
  creator: boolean;
  animiation_code: number;
}


function Loader() {
  const { progress } = useProgress()
  return <Html center className=' text-sm font-poppins'>characters {Math.floor(progress)} % loaded</Html>
}






const CharacterModel: React.FC<CharacterModelProps> = ({ modelPath, creator, animiation_code }) => {
  const okref = useRef();
  const model = useGLTF(modelPath);
  const clone = useMemo(() => SkeletonUtils.clone(model.scene), [model.scene]);
  // const {nodes} = useGraph(clone);
  const { actions, names } = useAnimations(model.animations, okref);
  // actions[names[0]]?.reset().play();
  useEffect(() => {
    actions[names[animiation_code]]?.reset().fadeIn(0.5).play()
  }, [])
  
  // console.log(names)

  return <primitive ref={okref} object={clone} scale={0.8} position={[0, -1, 0]} rotation-y={creator ? +1.1 : -1.1} />;
};


const GameLayout = () => {
  const { duelId } = useParams()

  // console.log("YESOOOOOOOOOOOOOOOOOOOOOOOOOOO////////.........", duelId)
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [creatorCharacterDetails, setCreatorCharacterDetails] = useState<CharacterDetails[]>([]);
  const [opponentCharacterDetails, setOpponetCharacterDetails] = useState<CharacterDetails[]>([]);
  const [creatorCharacterDetailsB, setCreatorCharacterDetailsB] = useState<CharacterDetails[]>([]);
  const [opponentCharacterDetailsB, setOpponetCharacterDetailsB] = useState<CharacterDetails[]>([]);

  const [hasCharacters, setHasCharacters] = useState<boolean>(false);
  const [hasDisplayedGame, setHasDisplayedGame] = useState<boolean>(false);
  const [duelCreator, setDuelCreator] = useState<string>(" ");
  // const [ setDuelJoiner] = useState<string>(" ");
  const [duelWinner, setDuelWinner] = useState<string>(" ");
  // const [ setDuelType] = useState<string>(" ");
  const [duelData, setDuelData] = useState<any>();
  const [showPopup, setShowPopup] = useState<boolean>(false);
  // const activeAccount = useActiveAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  // const [creatorWarriors, setCreatorWarriors] = useState<Warrior[]>();
  // const [opponentWarriors, setOpponentWarriors]= useState<Warrior[]>();
  const [battleLog, setBattleLog] = useState<BattleLogStep[]>([]);
  const charIdMapping = new Map<string, number>();
  const detailsMapping = new Map<number, typeof charactersdata[0]>();

  // console.log("animation data" + battleLog);



  console.log("checking isInitialized", isInitialized);





  useEffect(() => {
    getAllCharacters();
  }, [location]),





    // GAME RENDER ALGORITHM

    function renderGame() {
      if (currentStep < battleLog.length && !isAnimating) {
        setIsAnimating(true);
        console.log("Battle Log step is :", currentStep);
        const [fromCharId, toCharId] = battleLog[currentStep];

        // Find the elements
        const fromElement = document.getElementById(fromCharId.toString());
        const toElement = document.getElementById(toCharId.toString());

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
              setCurrentStep(currentStep + 1);
              setIsAnimating(false);
            }, 1000);
          }, 1000);
        }
        setHasDisplayedGame(true);
      }
    }


  const getAllCharacters = async () => {
    const { Status, request_payload: dPayload } = await readGameState(`duels/${duelId}`);
    console.log(dPayload, "DUEL PAYLOAD IS.......");
    const creatorPlaceholder = [];
    const opponentPlaceholder = [];
    // let dPayload = await fetchNotices("all_duels");
    if (Status) {
      setDuelWinner(dPayload?.duel_winner);
      setDuelCreator(dPayload?.duel_creator);
      // setDuelJoiner(dPayload?.duel_opponent);
      // setDuelType(dPayload?.difficulty);

      if (dPayload?.duel_opponent == "") {
        navigate(`/strategy/${duelId}`);
      }
      if (!hasCharacters) {

        const { Status, request_payload } = await readGameState("characters");
        // const request_payload = await fetchNotices("all_characters");
        if (Status) {
          const cPayload = request_payload?.filter((character: CharacterDetails) => character.id == JSON.parse(dPayload.creator_warriors)[0].char_id || character.id == JSON.parse(dPayload.creator_warriors)[1].char_id || character.id == JSON.parse(dPayload.creator_warriors)[2].char_id);
          // console.log("creator characters: " + cPayload);

          // const {Status: cStatus, request_payload: cPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_creator}`); // Call your function
          // console.log(cPayload, "cPayload");


          for (let i = 0; i < cPayload.length; i++) {
            const characterData = charactersdata.find((character) => character.name === cPayload[i].name);
            // console.log(characterData, "creators............characterData");
            const details = {
              ...cPayload[i],
              img: characterData ? characterData.img : undefined,
              model: characterData ? characterData.model : undefined,
              animiation_code: 4,
            };
            creatorPlaceholder.push(details);
          }
          setCreatorCharacterDetails(creatorPlaceholder);
          setCreatorCharacterDetailsB(creatorPlaceholder);

          // placeholder = [];

          // const request_payload = await fetchNotices("all_characters");
          const pPayload = request_payload?.filter((character: CharacterDetails) => character.id == JSON.parse(dPayload.opponent_warriors)[0].char_id || character.id == JSON.parse(dPayload.opponent_warriors)[1].char_id || character.id == JSON.parse(dPayload.opponent_warriors)[2].char_id);
          console.log("participant characters: " + pPayload);

          // const {Status: pStatus, request_payload: pPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_opponent}`); // Call your function
          console.log(pPayload, "pPayload");

          for (let i = 0; i < pPayload.length; i++) {
            const characterData = charactersdata.find((character) => character.name === pPayload[i].name);
            console.log(characterData, "characterData");
            console.log(characterData?.model, "characterData");
            const details = {
              ...pPayload[i],
              img: characterData ? characterData.img : undefined,
              model: characterData ? characterData.model : undefined,
              animiation_code: 4,
            };
            opponentPlaceholder.push(details);
          }
          setOpponetCharacterDetails(opponentPlaceholder); //
          setOpponetCharacterDetailsB(opponentPlaceholder);
          // placeholder = [];
          if (!hasDisplayedGame) {
            console.log("RENDERING GAME.......");
            // renderGame();
          }
          setHasCharacters(true);
        }
      }

      const newDemoLog: BattleLogStep[] = (JSON.parse(dPayload?.battle_log)).map((log: any) => {
        const newLog: BattleLogStep = [log[0].character_id, log[1].character_id];
        return newLog
      })
      setBattleLog(newDemoLog);
      // console.log("Battle entire struct.......: " + dPayload);
      setDuelData(dPayload);
      const creatorWarriors = JSON.parse(dPayload?.creator_warriors);
      const opponentWarriors = JSON.parse(dPayload?.opponent_warriors);

      // setCreatorWarriors(creatorWarriors);
      // setOpponentWarriors(opponentWarriors);

      if (!isAnimating && creatorWarriors.length > 0) {
        charIdMapping.set("creator_warrior1", creatorWarriors[0].char_id);
        charIdMapping.set("creator_warrior2", creatorWarriors[1].char_id);
        charIdMapping.set("creator_warrior3", creatorWarriors[2].char_id);

        charIdMapping.set("opponent_warrior1", opponentWarriors[0].char_id);
        charIdMapping.set("opponent_warrior2", opponentWarriors[1].char_id);
        charIdMapping.set("opponent_warrior3", opponentWarriors[2].char_id);

        console.log("Initializing dataaaaaaa:.......... " + charIdMapping.get("opponent_warrior2"));

        for (let i = 0; i < creatorPlaceholder.length; i++) {
          console.log("Creator Characters length is..................:", creatorPlaceholder.length);
          if (creatorPlaceholder[i].id == charIdMapping.get("creator_warrior1") || creatorPlaceholder[i].id == charIdMapping.get("creator_warrior2") || creatorPlaceholder[i].id == charIdMapping.get("creator_warrior3")) {
            console.log("FOUND CHAR ID:", creatorPlaceholder[i].id);
            detailsMapping.set(creatorPlaceholder[i].id, creatorPlaceholder[i]);
          }
        }

        for (let i = 0; i < opponentPlaceholder.length; i++) {
          console.log("Opponent Characters length is..................:", opponentPlaceholder.length);
          if (opponentPlaceholder[i].id == charIdMapping.get("opponent_warrior1") || opponentPlaceholder[i].id == charIdMapping.get("opponent_warrior2") || opponentPlaceholder[i].id == charIdMapping.get("opponent_warrior3")) {
            detailsMapping.set(opponentPlaceholder[i].id, opponentPlaceholder[i]);
            console.log("FOUND CHAR ID:", opponentPlaceholder[i].id);
          }
        }
        setIsInitialized(true);
      }

    }
  }

  console.log("Verifying details mapping.....", detailsMapping.get(1 as number));





  const animateStep = (step: number) => {
    if (step >= battleLog.length) {
      setIsAnimating(false);
      setShowPopup(true);
      return;
    }

    setIsAnimating(true);
    const fromCharId = JSON.parse(duelData?.battle_log)[step][0].character_id;
    const toCharId = JSON.parse(duelData?.battle_log)[step][1].character_id;
    // const [fromCharId, toCharId] = JSON.parse(duelData?.battle_log)[step];

    const fromChar = JSON.parse(duelData?.battle_log)[step][0];
    const toChar = JSON.parse(duelData?.battle_log)[step][1];

    console.log(fromCharId);
    


    const fromElement = document.getElementById(fromCharId.toString());
    const toElement = document.getElementById(toCharId.toString());

    if (fromElement && toElement) {
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      let deltaY;
      let deltaX;

      if (step == 0 || (step % 2) == 0) {
        deltaX = (toRect.left - fromRect.right) + ((toRect.right - toRect.left) / 1.5);
        deltaY = toRect.top - fromRect.top;

      } else {
        deltaX = toRect.right - fromRect.left + ((toRect.left - toRect.right) / 1.5);
        deltaY = toRect.top - fromRect.top;
      }

      fromElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      fromElement.style.transition = 'transform 1s';


      setCreatorCharacterDetails((prevDetails) =>
        prevDetails.map((character) =>
          character.id === fromChar.character_id ? { ...character, animiation_code: 0 } : character
        )
      );

      setOpponetCharacterDetails((prevDetails) =>
        prevDetails.map((character) =>
          character.id === fromChar.character_id ? { ...character, animiation_code: 0 } : character
        )
      );



      setTimeout(() => {
        fromElement.style.transform = '';
        fromElement.style.transition = 'transform 1s';


          // MODIFY CHARACTER STATS AFTER EACH BATTLE ROUND
          if (fromChar.owner == duelCreator) {

            setCreatorCharacterDetails((prevDetails) =>
              prevDetails.map((character) =>
                character.id === fromChar.character_id ? { ...character, health: fromChar.health, strength: fromChar.strength, attack: fromChar.attack, animiation_code: 4 } : character
              )
            );
            console.log("CREATOR DUEL MODOFIED.........", JSON.parse(duelData?.battle_log)[step][0]);

          } else {
            setOpponetCharacterDetails((prevDetails) => {
              return prevDetails.map((character) =>
                character.id === fromChar.character_id ? { ...character, health: fromChar.health, strength: fromChar.strength, attack: fromChar.attack, animiation_code: 4 } : character
              );
            });
            console.log("OPPONENT DUEL MODOFIED.........");

          }

          if (toChar.owner == duelCreator) {

            setCreatorCharacterDetails((prevDetails) => {
              return prevDetails.map((character) =>
                character.id === toChar.character_id ? { ...character, health: toChar.health, strength: toChar.strength, attack: toChar.attack, animiation_code: 4 } : character
              );
            });
            console.log("CREATOR DUEL MODOFIED.........");

          } else {
            setOpponetCharacterDetails((prevDetails) => {
              return prevDetails.map((character) =>
                character.id === toChar.character_id ? { ...character, health: toChar.health, strength: toChar.strength, attack: toChar.attack, animiation_code: 4 } : character
              );
            });
            console.log("OPPONENT DUEL MODOFIED.........");

          }


        setTimeout(() => {
          setCurrentStep(step + 1);
          animateStep(step + 1);
        }, 1000);
      }, 1000);

    } else {
      // If elements are not found, skip to the next step
      animateStep(step + 1);
    }
  };

  const renderAnimations = () => {
    if (!isAnimating) {
      setCurrentStep(0);
      // setCreatorCharacterDetails(creatorCharacterDetailsB);
      // setOpponetCharacterDetails(opponentCharacterDetailsB);
      animateStep(0);
      setIsAnimating(false);
      setCurrentStep(0);
    }
  };



  const closePopup = () => {
    setCreatorCharacterDetails(creatorCharacterDetailsB);
    setOpponetCharacterDetails(opponentCharacterDetailsB);
    setShowPopup(false);
  };




  return (
    <section className='flex overflow-hidden gap-10'>

      <main className=" w-3/12  mt-12 ml-10">
        <div className="text-myGreen font-belanosima text-xl text-center font-medium p-5 h-fit ">
          Creator Warriors
        </div>
        <p className=' text-center'> {duelData ? `${duelData.duel_creator.slice(0,9)}........${duelData.duel_creator.slice(-10)}` : "0x00" }</p>
        <p className='mb-6 text-center font-poppins'> {duelData?.opponents_strategy} </p>
        <div className='grid md:gap-6 gap-3'>
          {creatorCharacterDetails?.map((item, index) => (
            <div
              className={`w-[80%] grid grid-cols-2 gap-2 border bg-myBlack p-4 h-40 rounded-md ${item.health === 0 ? "border-red-700 border-spacing-5" : "border-green-400"
                }`}
              key={index}
            >
              <ImageWrap
                image={item.img}
                alt={detailsMapping.get(item.id)?.name as string}
                className=" w-32 h-32"
                objectStatus="object-cover"
              />
              <div className="flex flex-col items-center justify-center">
                <p
                  className={`${item.health === 0 ? "text-red-700" : "text-myGreen"} font-belanosima text-sm font-medium text-center mb-2`}
                >
                  {item.name}
                </p>
                <p className="text-sm text-gray-400 mb-1">
                  HLT: {item?.health}
                </p>
                <p className="text-sm text-gray-400 mb-1">
                  STR: {item.strength}
                </p>
                <p className="text-sm text-gray-400">
                  ATK: {item?.attack}
                </p>
                <p className="text-sm text-gray-400">
                  SPD: {item?.speed}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className=" mb-20 flex-row w-6/12 mt-10 mr-8">
        <div className="w-fit mx-auto">
          <div className="flex justify-between items-center p-8 border-8 border-green-800 w-[50vw] bg-[url('/nebulaDuelArena9.webp')] bg-cover bg-center py-20 min-h-[60vh] h-fit">
            <div className="flex flex-col h-fit overflow-visible ">
              {creatorCharacterDetails.map((warrior) => (
                <div
                  key={warrior.id}
                  id={warrior.id.toString()}
                  className="w-52 h-52  flex text-2xl text-white overflow-visible mt-[-40px] "
                >
                  <Canvas linear flat shadows camera={{ position: [0, 2, 3], fov: 30, }}>
                    <fog attach="fog" args={["#171720", 10, 30]} />
                    <ambientLight intensity={2} />
                    <directionalLight position={[3.3, 1.0, 4.4]} intensity={5} />
                    <directionalLight intensity={16} position={[1, 1, 1]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />
                    <Suspense fallback={<Loader />}>
                      <CharacterModel modelPath={warrior?.model} creator={true} animiation_code={warrior.animiation_code} />
                    </Suspense>
                  </Canvas>
                </div>
              ))}
            </div>
            <div className="flex flex-col h-fit overflow-visible mt-[]">
              {opponentCharacterDetails.map((warrior) => (
                <div
                  key={warrior.id}
                  id={warrior.id.toString()}
                  className=" w-52 h-52  flex text-2xl text-white overflow-visible mt-[-40px]"
                >
                  <Canvas linear flat shadows camera={{ position: [0, 2, 3], fov: 30 }}>
                    <fog attach="fog" args={["#171720", 10, 30]} />
                    <ambientLight intensity={2} />
                    <directionalLight position={[1, 1, 1]} intensity={5} />
                    <directionalLight intensity={16} position={[3.3, 1.0, 4.4]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />
                    <Suspense fallback={<Loader />}>
                      <CharacterModel modelPath={warrior?.model} creator={false} animiation_code={warrior.animiation_code} />
                    </Suspense>
                  </Canvas>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[100%] flex mt-10">
          <button className=' mx-auto flex border px-12 rounded-md py-4 cursor-pointer hover:bg-green-800 hover:border-white disabled:bg-red-600' onClick={() => renderAnimations()} disabled={isAnimating} >
            <p className=' font-belanosima'> Start Game</p>
          </button>
        </div>
      </div>

      <main className=" w-3/12  mt-12 mr-2 ">
        <div className="text-myGreen font-belanosima text-xl text-center font-medium p-5 h-fit ">
          Opponent Warriors
        </div>
        <p className=' text-center'> {duelData?.length> 10 ? `${duelData.duel_opponent.slice(0,9)}........${duelData.duel_opponent.slice(-10)}` : "Nebula BOT" }</p>
        <p className='mb-6 text-center font-poppins'> {duelData?.opponents_strategy} </p>
        <div className='grid md:gap-6 gap-3'>
          {opponentCharacterDetails?.map((item, index) => (
            <div
              className={`w-[80%] grid grid-cols-2 gap-2 border bg-myBlack p-4 h-40 rounded-md ${item.health === 0 ? "border-red-700 border-spacing-5" : "border-green-400"
                }`}
              key={index}
            >
              <ImageWrap
                image={item.img}
                alt={detailsMapping.get(item.id)?.name as string}
                className=" w-32 h-32"
                objectStatus="object-cover"
              />
              <div className="flex flex-col items-center justify-center">
                <p
                  className={`${item.health === 0 ? "text-red-700" : "text-myGreen"} font-belanosima text-sm font-medium text-center mb-2`}
                >
                  {item.name}
                </p>
                <p className="text-sm text-gray-400 mb-1">
                  HLT: {item?.health}
                </p>
                <p className="text-sm text-gray-400 mb-1">
                  STR: {item.strength}
                </p>
                <p className="text-sm text-gray-400">
                  ATK: {item?.attack}
                </p>
                <p className="text-sm text-gray-400">
                  SPD: {item?.speed}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
      {showPopup && <Popup winnerAddress={duelWinner} onClose={closePopup} />}
    </section>
  );






















};





export default GameLayout