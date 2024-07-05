// import React, { useState, useEffect, useRef, Suspense } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { useSpring, animated } from '@react-spring/three';
// import CharacterModel from './CharacterModel'; // Assume you have this component
// import Loader from './Loader'; // Assume you have this component

// const MyComponent = ({ creatorCharacterDetails, opponentCharacterDetails, duelData, duelCreator, setCreatorCharacterDetails, setOpponentCharacterDetails }) => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);
//   const modelsRef = useRef({});

//   const animateStep = (step) => {
//     if (step >= duelData?.battle_log.length) {
//       setIsAnimating(false);
//       setShowPopup(true);
//       return;
//     }

//     setIsAnimating(true);
//     const fromChar = duelData?.battle_log[step][0];
//     const toChar = duelData?.battle_log[step][1];

//     const fromElement = modelsRef.current[fromChar.character_id];
//     const toElement = modelsRef.current[toChar.character_id];

//     if (fromElement && toElement) {
//       const fromPos = fromElement.position;
//       const toPos = toElement.position;

//       const deltaX = toPos.x - fromPos.x;
//       const deltaY = toPos.y - fromPos.y;
//       const deltaZ = toPos.z - fromPos.z;

//       useSpring({ 
//         config: { duration: 1000 },
//         from: { position: [fromPos.x, fromPos.y, fromPos.z] },
//         to: { position: [toPos.x + deltaX, toPos.y + deltaY, toPos.z + deltaZ] }
//       }).start(() => {
//         // Update the character's health, strength, and attack stats here
//         if (fromChar.owner === duelCreator) {
//           setCreatorCharacterDetails((prevDetails) =>
//             prevDetails.map((character) =>
//               character.id === fromChar.character_id ? { ...character, health: fromChar.health, strength: fromChar.strength, attack: fromChar.attack } : character
//             )
//           );
//         } else {
//           setOpponentCharacterDetails((prevDetails) =>
//             prevDetails.map((character) =>
//               character.id === fromChar.character_id ? { ...character, health: fromChar.health, strength: fromChar.strength, attack: fromChar.attack } : character
//             )
//           );
//         }

//         if (toChar.owner === duelCreator) {
//           setCreatorCharacterDetails((prevDetails) =>
//             prevDetails.map((character) =>
//               character.id === toChar.character_id ? { ...character, health: toChar.health, strength: toChar.strength, attack: toChar.attack } : character
//             )
//           );
//         } else {
//           setOpponentCharacterDetails((prevDetails) =>
//             prevDetails.map((character) =>
//               character.id === toChar.character_id ? { ...character, health: toChar.health, strength: toChar.strength, attack: toChar.attack } : character
//             )
//           );
//         }

//         setCurrentStep(step + 1);
//         animateStep(step + 1);
//       });
//     } else {
//       // If elements are not found, skip to the next step
//       animateStep(step + 1);
//     }
//   };

//   return (
//     <div className="w-fit mx-auto">
//       <div className="flex justify-between items-center p-8 border-8 border-green-800 w-[50vw] bg-[url('/nebulaDuelArena9.webp')] bg-cover bg-center py-20 min-h-[60vh] h-fit">
//         <Canvas linear flat shadows camera={{ position: [0, 2, 3], fov: 30 }}>
//           <fog attach="fog" args={["#171720", 10, 30]} />
//           <ambientLight intensity={2} />
//           <directionalLight position={[3.3, 1.0, 4.4]} intensity={5} />
//           <directionalLight intensity={16} position={[1, 1, 1]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />

//           <Suspense fallback={<Loader />}>
//             {creatorCharacterDetails.map((warrior) => (
//               <group
//                 key={warrior.id}
//                 ref={(el) => (modelsRef.current[warrior.id] = el)}
//                 position={[warrior.initialX, warrior.initialY, warrior.initialZ]} // Add initial positions to your warriors
//               >
//                 <CharacterModel modelPath={warrior.model} creator={true} />
//               </group>
//             ))}

//             {opponentCharacterDetails.map((warrior) => (
//               <group
//                 key={warrior.id}
//                 ref={(el) => (modelsRef.current[warrior.id] = el)}
//                 position={[warrior.initialX, warrior.initialY, warrior.initialZ]} // Add initial positions to your warriors
//               >
//                 <CharacterModel modelPath={warrior.model} creator={false} />
//               </group>
//             ))}
//           </Suspense>
//         </Canvas>
//       </div>

//       {showPopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-8 rounded-md shadow-md">
//             <h2 className="text-2xl font-bold">Winner!</h2>
//             <p>{/* Winner's name here */}</p>
//             <button onClick={() => setShowPopup(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyComponent;






// import React, { useState, useEffect, useRef, useMemo, Suspense, useImperativeHandle, ForwardRefRenderFunction } from 'react';
// import * as THREE from "three"
// // import { demoLog2 } from './BattleData';
// // import fetchNotices from '../../utils/readSubgraph';
// // import { useActiveAccount } from 'thirdweb/react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import charactersdata from '../../utils/Charactersdata';
// import readGameState from '../../utils/readState';
// import { Canvas } from '@react-three/fiber';
// // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { useAnimations, useGLTF } from '@react-three/drei';
// import { Html, useProgress } from '@react-three/drei'
// import { SkeletonUtils } from 'three/examples/jsm/Addons.js';
// // import { triNoise3D } from 'three/examples/jsm/nodes/Nodes.js';
// import { ImageWrap } from '../atom/ImageWrap';
// // import charactersdata from '../../utils/Charactersdata';
// import Popup from './Popup';
// import signMessages from '../../utils/relayTransaction';
// import { toast } from 'sonner';
// import { type GLTF, GLTFLoader } from 'three-stdlib';
// import { AnimationMixer, Clock } from 'three';

// type BattleLogStep = [number, number];


// // console.log("Battle Log:", JSON.parse(demoLog));

// interface CharacterDetails {
//   id: number;
//   name: string;
//   health: number;
//   strength: number;
//   attack: number;
//   speed: number;
//   owner: string;
//   price: number;
//   super_power: string;
//   total_battles: number;
//   total_losses: number;
//   total_wins: number;
//   img: string;
//   model: string;
//   animiation_id: number;
// }



// interface CharacterModelProps {
//   modelPath: string;
//   creator: boolean;
// }


// function Loader() {
//   const { progress } = useProgress()
//   return <Html center className=' text-sm font-poppins'>characters {Math.floor(progress)} % loaded</Html>
// }

// interface AnimationControls {
//   playAnimation: (animationName: string) => void;
// }

// interface CharacterModelProps {
//   modelPath: string;
//   creator: boolean;
//   id: string;
//   position: [number, number, number];
//   animiation_id: number;
// }

// interface MyComponentProps {
//   creatorCharacterDetails: CharacterDetails[];
//   opponentCharacterDetails: CharacterDetails[];
//   duelData: any; // Replace with a more specific type if possible
//   duelCreator: string;
// }


// const CharacterModel: ForwardRefRenderFunction<AnimationControls, CharacterModelProps> = ({ modelPath, creator, id, position, animiation_id }, ref) => {
//   const groupRef = useRef();
//   // console.log(groupRef);
//   // console.log(ref);
//   const model = useGLTF(modelPath);
//   const clone = useMemo(() => SkeletonUtils.clone(model.scene), [model.scene]);
//   const { actions, names } = useAnimations(model.animations, groupRef);
//   // const clock = new Clock();

//   useEffect(() => {
//     // console.log("available animiations are:", animiation_id)
//       actions[names[Number(animiation_id)]]?.reset().fadeIn(0.5).play();
//   }, [actions, names]);

//   useImperativeHandle(ref, () => ({
//     playAnimation: (animationName: string) => {
//       actions[animationName]?.reset().fadeIn(0.5).play();
//     }
//   }));


//   return (
//     <group ref={groupRef as any} name={id} position={position} rotation-y={creator ? +1.1 : -1.1}>
//       <primitive object={clone} scale={0.8} />
//     </group>
//   );
// };



// const GameLayout = () => {
//   const { duelId } = useParams()

//   // console.log("YESOOOOOOOOOOOOOOOOOOOOOOOOOOO////////.........", duelId)
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [creatorCharacterDetails, setCreatorCharacterDetails] = useState<CharacterDetails[]>([]);
//   const [opponentCharacterDetails, setOpponetCharacterDetails] = useState<CharacterDetails[]>([]);
//   const [creatorCharacterDetailsB, setCreatorCharacterDetailsB] = useState<CharacterDetails[]>([]);
//   const [opponentCharacterDetailsB, setOpponetCharacterDetailsB] = useState<CharacterDetails[]>([]);

//   const [hasCharacters, setHasCharacters] = useState<boolean>(false);
//   const [hasDisplayedGame, setHasDisplayedGame] = useState<boolean>(false);
//   const [duelCreator, setDuelCreator] = useState<string>(" ");
//   // const [ setDuelJoiner] = useState<string>(" ");
//   const [duelWinner, setDuelWinner] = useState<string>(" ");
//   // const [ setDuelType] = useState<string>(" ");
//   const [duelData, setDuelData] = useState<any>();
//   const [showPopup, setShowPopup] = useState<boolean>(false);
//   // const activeAccount = useActiveAccount();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isInitialized, setIsInitialized] = useState(false);
//   // const [creatorWarriors, setCreatorWarriors] = useState<Warrior[]>();
//   // const [opponentWarriors, setOpponentWarriors]= useState<Warrior[]>();
//   const [battleLog, setBattleLog] = useState<BattleLogStep[]>([]);
//   const charIdMapping = new Map<string, number>();
//   const detailsMapping = new Map<number, typeof charactersdata[0]>();
//   const CharacterModelWithRef = React.forwardRef(CharacterModel);
//   const creatorRefs = useRef<(React.RefObject<AnimationControls>)[]>([]);
//   const opponentRefs = useRef<(React.RefObject<AnimationControls>)[]>([]);

//   useEffect(() => {
//     creatorRefs.current = creatorCharacterDetails.map(() => React.createRef<AnimationControls>());
//     opponentRefs.current = opponentCharacterDetails.map(() => React.createRef<AnimationControls>());
//   }, [creatorCharacterDetails, opponentCharacterDetails]);


//   // console.log("animation data" + battleLog);



//   // console.log("checking isInitialized", isInitialized);





//   useEffect(() => {
//     getAllCharacters();
//   }, [location]),





//     // GAME RENDER ALGORITHM

//     function renderGame() {
//       if (currentStep < battleLog.length && !isAnimating) {
//         setIsAnimating(true);
//         console.log("Battle Log step is :", currentStep);
//         const [fromCharId, toCharId] = battleLog[currentStep];

//         // Find the elements
//         const fromElement = document.getElementById(fromCharId.toString());
//         const toElement = document.getElementById(toCharId.toString());

//         if (fromElement && toElement) {
//           const fromRect = fromElement.getBoundingClientRect();
//           const toRect = toElement.getBoundingClientRect();

//           const deltaX = toRect.left - fromRect.left;
//           const deltaY = toRect.top - fromRect.top;

//           fromElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
//           fromElement.style.transition = 'transform 1s';

//           setTimeout(() => {
//             fromElement.style.transform = '';
//             fromElement.style.transition = 'transform 1s';

//             setTimeout(() => {
//               setCurrentStep(currentStep + 1);
//               setIsAnimating(false);
//             }, 1000);
//           }, 1000);
//         }
//         setHasDisplayedGame(true);
//       }
//     }


//   const getAllCharacters = async () => {
//     const { Status, request_payload: dPayload } = await readGameState(`duels/${duelId}`);
//     console.log(dPayload, "DUEL PAYLOAD IS.......");
//     const creatorPlaceholder = [];
//     const opponentPlaceholder = [];
//     // let dPayload = await fetchNotices("all_duels");
//     if (Status) {
//       setDuelWinner(dPayload?.duel_winner);
//       setDuelCreator(dPayload?.duel_creator);
//       // setDuelJoiner(dPayload?.duel_opponent);
//       // setDuelType(dPayload?.difficulty);

//       if (dPayload?.duel_opponent == "") {
//         navigate(`/strategy/${duelId}`);
//       }
//       if (!hasCharacters) {

//         const { Status, request_payload } = await readGameState("characters");
//         // const request_payload = await fetchNotices("all_characters");
//         if (Status) {
//           const cPayload = request_payload?.filter((character: CharacterDetails) => character.id == JSON.parse(dPayload.creator_warriors)[0].char_id || character.id == JSON.parse(dPayload.creator_warriors)[1].char_id || character.id == JSON.parse(dPayload.creator_warriors)[2].char_id);
//           // console.log("creator characters: " + cPayload);

//           // const {Status: cStatus, request_payload: cPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_creator}`); // Call your function
//           // console.log(cPayload, "cPayload");


//           for (let i = 0; i < cPayload.length; i++) {
//             const characterData = charactersdata.find((character) => character.name === cPayload[i].name);
//             // console.log(characterData, "creators............characterData");
//             const details = {
//               ...cPayload[i],
//               img: characterData ? characterData.img : undefined,
//               model: characterData ? characterData.model : undefined,
//               animiation_id: 4,
//             };
//             creatorPlaceholder.push(details);
//           }
//           setCreatorCharacterDetails(creatorPlaceholder);
//           setCreatorCharacterDetailsB(creatorPlaceholder);

//           // placeholder = [];

//           // const request_payload = await fetchNotices("all_characters");
//           const pPayload = request_payload?.filter((character: CharacterDetails) => character.id == JSON.parse(dPayload.opponent_warriors)[0].char_id || character.id == JSON.parse(dPayload.opponent_warriors)[1].char_id || character.id == JSON.parse(dPayload.opponent_warriors)[2].char_id);
//           console.log("participant characters: " + pPayload);

//           // const {Status: pStatus, request_payload: pPayload} = await readGameState(`get_duel_characters/${duelId}/${dPayload.duel_opponent}`); // Call your function
//           // console.log(pPayload, "pPayload");

//           for (let i = 0; i < pPayload.length; i++) {
//             const characterData = charactersdata.find((character) => character.name === pPayload[i].name);
//             // console.log(characterData, "characterData");
//             // console.log(characterData?.model, "characterData");
//             const details = {
//               ...pPayload[i],
//               img: characterData ? characterData.img : undefined,
//               model: characterData ? characterData.model : undefined,
//               animiation_id: 4,
//             };
//             opponentPlaceholder.push(details);
//           }
//           setOpponetCharacterDetails(opponentPlaceholder); //
//           setOpponetCharacterDetailsB(opponentPlaceholder);
//           // placeholder = [];
//           if (!hasDisplayedGame) {
//             console.log("RENDERING GAME.......");
//             // renderGame();
//           }
//           setHasCharacters(true);
//         }
//       }

//       const newDemoLog: BattleLogStep[] = (JSON.parse(dPayload?.battle_log)).map((log: any) => {
//         const newLog: BattleLogStep = [log[0].character_id, log[1].character_id];
//         return newLog
//       })
//       setBattleLog(newDemoLog);
//       // console.log("Battle entire struct.......: " + dPayload);
//       setDuelData(dPayload);
//       const creatorWarriors = JSON.parse(dPayload?.creator_warriors);
//       const opponentWarriors = JSON.parse(dPayload?.opponent_warriors);

//       // setCreatorWarriors(creatorWarriors);
//       // setOpponentWarriors(opponentWarriors);

//       if (!isAnimating && creatorWarriors.length > 0) {
//         charIdMapping.set("creator_warrior1", creatorWarriors[0].char_id);
//         charIdMapping.set("creator_warrior2", creatorWarriors[1].char_id);
//         charIdMapping.set("creator_warrior3", creatorWarriors[2].char_id);

//         charIdMapping.set("opponent_warrior1", opponentWarriors[0].char_id);
//         charIdMapping.set("opponent_warrior2", opponentWarriors[1].char_id);
//         charIdMapping.set("opponent_warrior3", opponentWarriors[2].char_id);

//         // console.log("Initializing dataaaaaaa:.......... " + charIdMapping.get("opponent_warrior2"));

//         for (let i = 0; i < creatorPlaceholder.length; i++) {
//           console.log("Creator Characters length is..................:", creatorPlaceholder.length);
//           if (creatorPlaceholder[i].id == charIdMapping.get("creator_warrior1") || creatorPlaceholder[i].id == charIdMapping.get("creator_warrior2") || creatorPlaceholder[i].id == charIdMapping.get("creator_warrior3")) {
//             console.log("FOUND CHAR ID:", creatorPlaceholder[i].id);
//             detailsMapping.set(creatorPlaceholder[i].id, creatorPlaceholder[i]);
//           }
//         }

//         for (let i = 0; i < opponentPlaceholder.length; i++) {
//           // console.log("Opponent Characters length is..................:", opponentPlaceholder.length);
//           if (opponentPlaceholder[i].id == charIdMapping.get("opponent_warrior1") || opponentPlaceholder[i].id == charIdMapping.get("opponent_warrior2") || opponentPlaceholder[i].id == charIdMapping.get("opponent_warrior3")) {
//             detailsMapping.set(opponentPlaceholder[i].id, opponentPlaceholder[i]);
//             console.log("FOUND CHAR ID:", opponentPlaceholder[i].id);
//           }
//         }
//         setIsInitialized(true);
//       }

//     }
//   }

//   // console.log("Verifying details mapping.....", detailsMapping.get(1 as number));





//   const animateStep = (step: number) => {
//     const battleLog = JSON.parse(duelData?.battle_log);
//     if (step >= battleLog.length) {
//       setIsAnimating(false);
//       // setShowPopup(true); // Assuming you have a popup mechanism
//       return;
//     }

//     setIsAnimating(true);
//     const fromCharId = battleLog[step][0].character_id;
//     const toCharId = battleLog[step][1].character_id;
    
//     const fromChar = battleLog[step][0];
//     const toChar = battleLog[step][1];
    
//     const fromElement = document.querySelector(`[name='${fromCharId}']`);
//     const toElement = document.querySelector(`[name='${toCharId}']`);
    
//     console.log("Attempting aniniations.........", fromElement, toElement);
//     if (fromElement && toElement) {
//       const fromRect = fromElement.getBoundingClientRect();
//       const toRect = toElement.getBoundingClientRect();

//       let deltaY;
//       let deltaX;

//       if (step === 0 || step % 2 === 0) {
//         deltaX = (toRect.left - fromRect.right) + ((toRect.right - toRect.left) / 1.5);
//         deltaY = toRect.top - fromRect.top;
//       } else {
//         deltaX = toRect.right - fromRect.left + ((toRect.left - toRect.right) / 1.5);
//         deltaY = toRect.top - fromRect.top;
//       }

//       fromElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
//       fromElement.style.transition = 'transform 1s';

//       setTimeout(() => {
//         fromElement.style.transform = '';
//         fromElement.style.transition = 'transform 1s';

//         setTimeout(() => {
//           setCurrentStep(step + 1);

//           if (fromChar.owner === duelCreator) {
//             setCreatorCharacterDetails((prevDetails) =>
//               prevDetails.map((character) =>
//                 character.id === fromChar.character_id ? { ...character, health: fromChar.health, strength: fromChar.strength, attack: fromChar.attack } : character
//               )
//             );
//           } else {
//             setOpponetCharacterDetails((prevDetails) =>
//               prevDetails.map((character) =>
//                 character.id === fromChar.character_id ? { ...character, health: fromChar.health, strength: fromChar.strength, attack: fromChar.attack } : character
//               )
//             );
//           }

//           if (toChar.owner === duelCreator) {
//             setCreatorCharacterDetails((prevDetails) =>
//               prevDetails.map((character) =>
//                 character.id === toChar.character_id ? { ...character, health: toChar.health, strength: toChar.strength, attack: toChar.attack } : character
//               )
//             );
//           } else {
//             setOpponetCharacterDetails((prevDetails) =>
//               prevDetails.map((character) =>
//                 character.id === toChar.character_id ? { ...character, health: toChar.health, strength: toChar.strength, attack: toChar.attack } : character
//               )
//             );
//           }

//           animateStep(step + 1);
//         }, 1000);
//       }, 1000);
//     } else {
//       animateStep(step + 1);
//     }
//   };


//   const renderAnimations = async() => {
//     if (duelData?.difficulty == "P2P" && duelData.is_completed == false) {
//       const dataObject = {"func": "fight", "duel_id": duelId};  
//       const txhash = await signMessages(dataObject);
//       // console.log("TX HASH: ", txhash);
//       if (txhash) {
//         toast.success("Fight Started Sucessfully!...... Click the button again to view battle", {
//           position: "top-right",
//         });
//         navigate(`/duels/${duelId}`);
//       }
//     } else {
//       if (!isAnimating) {
//         console.log("DISPLAYING BATTLE SCENES........");
//         setCurrentStep(0);
//         animateStep(0);
//         setIsAnimating(false);
//         setCurrentStep(0);
//       }
//     }
//   };



//   const closePopup = () => {
//     setCreatorCharacterDetails(creatorCharacterDetailsB);
//     setOpponetCharacterDetails(opponentCharacterDetailsB);
//     setShowPopup(false);
//   };




//   return (
//     <section className='flex overflow-hidden gap-10'>

//       <main className=" w-3/12  mt-12 ml-10">
//         <div className="text-myGreen font-belanosima text-xl text-center font-medium p-5 h-fit ">
//           Creator Warriors
//         </div>
//         <p className=' text-center'> {duelData ? `${duelData.duel_creator.slice(0,9)}........${duelData.duel_creator.slice(-10)}` : "0x00" }</p>
//         <p className='mb-6 text-center font-poppins'> {duelData?.creators_strategy} </p>
//         <div className='grid md:gap-6 gap-3'>
//           {creatorCharacterDetails?.map((item, index) => (
//             <div
//               className={`w-[80%] grid grid-cols-2 gap-2 border bg-myBlack p-4 h-40 rounded-md ${item.health === 0 ? "border-red-700 border-spacing-5" : "border-green-400"
//                 }`}
//               key={index}
//             >
//               <ImageWrap
//                 image={item.img}
//                 alt={detailsMapping.get(item.id)?.name as string}
//                 className=" w-32 h-32"
//                 objectStatus="object-cover"
//               />
//               <div className="flex flex-col items-center justify-center">
//                 <p
//                   className={`${item.health === 0 ? "text-red-700" : "text-myGreen"} font-belanosima text-sm font-medium text-center mb-2`}
//                 >
//                   {item.name}
//                 </p>
//                 <p className="text-sm text-gray-400 mb-1">
//                   HLT: {item?.health}
//                 </p>
//                 <p className="text-sm text-gray-400 mb-1">
//                   STR: {item.strength}
//                 </p>
//                 <p className="text-sm text-gray-400">
//                   ATK: {item?.attack}
//                 </p>
//                 <p className="text-sm text-gray-400">
//                   SPD: {item?.speed}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>

//       <div className=" mb-20 flex-row w-6/12 mt-10 mr-8">
          

//   <div className="w-fit mx-auto">
//   <div className="flex justify-between items-center border-8 border-green-800 w-[50vw] bg-[url('/nebulaDuelArena9.webp')] bg-cover bg-center min-h-[60vh] h-[75vh]"> {/* Changed min-h-[60vh] to h-screen */}
//     <Canvas linear={true} flat={true} shadows camera={{ position: [0, 2, 10], fov: 30 }} style={{border: '2px solid #000', width: '50vw', height: '100%'}} > {/* Ensure height is set to 100% */}
//       <fog attach="fog" args={["#171720", 10, 30]} />
//       <ambientLight intensity={2} />
//       <directionalLight position={[3.3, 1.0, 4.4]} intensity={5} />
//       <directionalLight intensity={16} position={[1, 1, 1]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} />

//       <Suspense fallback={<Loader />}>
//         {creatorCharacterDetails.map((warrior, index) => (
//           <CharacterModelWithRef
//             key={warrior.id}
//             modelPath={warrior.model}
//             creator={true}
//             id={warrior.id.toString()}
//             position={[-3, (index - (creatorCharacterDetails.length / 2)) * 2, -2.2]}
//             ref={creatorRefs.current[index]}
//             animiation_id = {warrior.animiation_id}
//           />
//         ))}
//         {opponentCharacterDetails.map((warrior, index) => (
//           <CharacterModelWithRef
//             key={warrior.id}
//             modelPath={warrior.model}
//             creator={false}
//             id={warrior.id.toString()}
//             position={[3, (index - (opponentCharacterDetails.length / 2)) * 2, -2.4]}
//             ref={opponentRefs.current[index]}
//             animiation_id = {warrior.animiation_id}
//           />
//         ))}
//       </Suspense>
//     </Canvas>
//   </div>
// </div>


//         <div className="w-[100%] flex mt-10">
//           <button className=' mx-auto flex border px-12 rounded-md py-4 cursor-pointer hover:bg-green-800 hover:border-white' onClick={() => renderAnimations()} disabled={isAnimating} >
//             <p className=' font-belanosima'> Start Game</p>
//           </button>
//         </div>
//       </div>

//       <main className=" w-3/12  mt-12 mr-2 ">
//         <div className="text-myGreen font-belanosima text-xl text-center font-medium p-5 h-fit ">
//           Opponent Warriors
//         </div>
        // <p className=' text-center'> {duelData.length> 10 ? `${duelData.duel_opponent.slice(0,9)}........${duelData.duel_opponent.slice(-10)}` : "Nebula BOT" }</p>
//         <p className='mb-6 text-center font-poppins'> {duelData?.opponents_strategy} </p>
//         <div className='grid md:gap-6 gap-3'>
//           {opponentCharacterDetails?.map((item, index) => (
//             <div
//               className={`w-[80%] grid grid-cols-2 gap-2 border bg-myBlack p-4 h-40 rounded-md ${item.health === 0 ? "border-red-700 border-spacing-5" : "border-green-400"
//                 }`}
//               key={index}
//             >
//               <ImageWrap
//                 image={item.img}
//                 alt={detailsMapping.get(item.id)?.name as string}
//                 className=" w-32 h-32"
//                 objectStatus="object-cover"
//               />
//               <div className="flex flex-col items-center justify-center">
//                 <p
//                   className={`${item.health === 0 ? "text-red-700" : "text-myGreen"} font-belanosima text-sm font-medium text-center mb-2`}
//                 >
//                   {item.name}
//                 </p>
//                 <p className="text-sm text-gray-400 mb-1">
//                   HLT: {item?.health}
//                 </p>
//                 <p className="text-sm text-gray-400 mb-1">
//                   STR: {item.strength}
//                 </p>
//                 <p className="text-sm text-gray-400">
//                   ATK: {item?.attack}
//                 </p>
//                 <p className="text-sm text-gray-400">
//                   SPD: {item?.speed}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//       {showPopup && <Popup winnerAddress={duelWinner} onClose={closePopup} />}
//     </section>
//   );






















// };





// export default GameLayout