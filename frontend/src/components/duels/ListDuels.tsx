import { Link } from "react-router-dom";
import breadcrumb from "../../assets/img/breadcrumb_img03.png";
import { ImageWrap } from "../atom/ImageWrap.js";
import "animate.css/animate.min.css";
import { useState, useEffect } from "react";
// import readGameState from "../../utils/readState.js";
// import DuelCard from "./DuelCard1.js";
import DuelCard from "./DuelCard.js";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import { useActiveAccount } from "thirdweb/react";
import fetchNotices from "../../utils/readSubgraph.js";

interface Duel {
  id: number;
  title: string;
  description: string;
}

interface Duel {
  duel_id: number;
  duel_creator: string;
  description: string;
  characters: string[];
  winner: string;
  competitors: string[];
  logs: string[];
  creation_time: number;
  stake_amount: number;
  duel_opponent: string;
  creators_strategy: string;
  opponents_strategy: string;
  duel_winner: string;
  is_completed: boolean;
}

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


const ListDuels = () => {
  const [activeTab, setActiveTab] = useState<"open" | "all">("open");
  const [duels, setDuels] = useState<Duel[]>([]);
  // const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [allDuels, setAllDuels] = useState<Duel[]>([]);
  const [allPlayers, setAllPlayers] = useState<ProfileData[]>([]);
  const location = useLocation();
  // const activeAccount = useActiveAccount();
  const navigate = useNavigate();


  // console.log("Available Duels", activeDuels);
  // console.log("All Duels", allDuels);

  const fetchAllPlayers = async () => {
    try{
      const request_payload = await fetchNotices("all_profiles");
      setAllPlayers(request_payload);
    } catch(error) {
      console.log("error", error);
    }
  }

  const routeToCreateDuel = async () => {
    navigate(`/selectWarriors`)
  }


  useEffect(() => {
    async function getDuels() {
      await fetchAllPlayers();
      try {
          const resDuels = await fetchNotices("all_duels");
          setAllDuels(resDuels);
          const allAvailavleDuels = resDuels.filter((duel:any) => duel.is_completed == false && duel.difficulty == "P2P")
          setActiveDuels(allAvailavleDuels);
          setDuels(allAvailavleDuels);
      } catch (e: any) {
        console.log("error:", e);
      }
    }
    getDuels();
  }, [location]);

  useEffect(() => {
    if (activeTab === "open") {
      setDuels(activeDuels);
    } else {
      setDuels(allDuels);
    }
  }, [activeTab]);

  // console.log("Fetching open duels", duels);

  // const toggleAccordion = (id: number) => {
  //   setActiveAccordion(activeAccordion === id ? null : id);
  // };

  return (
    <div className="main--area overflow-x-hidden">
      {/* Breadcrumb Area */}
      <section className="breadcrumb-area relative bg-center bg-cover min-h-[561px] flex items-center pt-[110px] pb-[75px] px-0 before:content-[''] before:absolute before:w-6/12 before:bg-[#45f882] before:h-[50px] before:left-0 before:bottom-0 after:content-[''] after:absolute after:w-6/12 after:bg-[#45f882] after:h-[50px] after:left-auto after:right-0 after:bottom-0 before:clip-path-polygon-[0_0,0_100%,100%_100%] after:clip-path-polygon-[100%_0,0_100%,100%_100%]">
        <div className="container">
          <div className=" relative px-20 py-0 lg:px-0 md:px-0 sm:px-0 xsm:px-0">
            <div className="flex flex-wrap mx-[-15px]">
              <div className="w-6/12 basis-6/12 xl:w-6/12 xl:basis-6/12 lg:w-7/12 lg:basis-7/12 md:w-full md:basis-full sm:w-full sm:basis-full xsm:w-full xsm:basis-full relative px-[15px]">
                <div className="breadcrumb__content text-left md:text-center sm:text-center xsm:text-center">
                  <h2 className="title text-[60px] font-extrabold tracking-[3px] leading-none m-0 xl:text-[50px] xl:tracking-[2px] lg:text-[50px] lg:tracking-[2px] md:text-[50px] md:tracking-[2px] sm:text-[43px] sm:tracking-[2px] xsm:text-[43px] xsm:tracking-[2px] uppercase">
                    ALL DUELS
                  </h2>
                  <nav>
                    <ol className=" justify-start sm:justify-center xsm:justify-center mt-3 mb-0 mx-0 flex flex-wrap list-none md:justify-center sm:text-center xsm:text-center">
                      <li className=" uppercase font-bold text-[14px] tracking-[2px] flex items-center after:content-[''] after:block after:w-2 after:h-2 after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:mx-2.5 after:rounded-full after:bg-[#45f882] hover:after:bg-[#ffbe18]">
                        <Link
                          to={`/`}
                          className="hover:text-[#ffbe18] text-green-400"
                        >
                          Home
                        </Link>
                      </li>
                      <li
                        className="uppercase font-bold text-[14px] tracking-[2px] flex items-center after:content-[''] after:block after:w-2 after:h-2 after:transition-all after:duration-[0.3s] after:ease-[ease-out] after:mx-2.5 after:rounded-full after:bg-[#45f882] hover:after:bg-[#ffbe18] active text-[#fff]"
                        aria-current="page"
                      >
                        Tournament
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
              <div className="w-6/12 basis-6/12 xl:w-6/12 xl:basis-6/12 lg:w-5/12 lg:basis-5/12 md:w-full md:basis-full sm:w-full sm:basis-full xsm:w-full xsm:basis-full relative px-[15px] block md:hidden sm:hidden xsm:hidden">
                <div className="breadcrumb__img absolute -translate-y-2/4 right-[30px] top-2/4 group xl:right-[60px] xl:top-[60%] lg:right-[60px] lg:top-[60%]">
                  <img
                    className="max-h-[412px] max-w-[402px] group-hover:animate-[breadcrumbShake_0.82s_cubic-bezier(0.36,0.07,0.19,0.97)_both] lg:max-h-[260px] lg:max-w-[255px] xl:max-h-80 xl:max-w-[310px]"
                    src="assets/img/others/breadcrumb_img03.png"
                    alt="img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col justify-end items-center">
          <ImageWrap
            image={breadcrumb}
            className="w-[100%] md:w-[80%] lg:w-[80%] xxl:w-[60%] 2xl:w-[60%]"
            alt="Game-Avatar"
          />
        </aside>
      </section>

      {/* See Duel List */}
      <div className=" float-right border mr-20 mt-10 mb-20 py-3 px-10 rounded-md border-[#45f882] text-lg shadow-md shadow-green-300 hover:bg-[#45f882] hover:text-black hover:cursor-pointer" onClick={routeToCreateDuel}>
            <p className=" font-belanosima"> + Create Duel</p>
      </div>

      <section className="breadcrumb-area-02 w-full pb-[120px] pt-10 bg-center bg-cover mt-10">
        <div className=" p-10">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setActiveTab("open")}
              className={`px-10 py-2 mx-2 rounded-xl transition duration-500 ease-in-out transform hover:-translate-y-1 text-xl font-belanosima hover:scale-110 ${
                activeTab === "open" ? "bg-[#45f882] text-black" : "bg-gray-700"
              }`}
            >
              Open Duels
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-10 py-2 mx-2 rounded-xl transition duration-500 ease-in-out transform hover:-translate-y-1 text-xl font-belanosima hover:scale-110 ${
                activeTab === "all" ? "bg-[#45f882] text-black" : "bg-gray-700"
              }`}
            >
              All Duels
            </button>
          </div>
          <div className=" p-6">
            {duels?.length > 0 ? duels?.map((duel) => 
            (<DuelCard duel_id={duel.duel_id} duel_creator={duel.duel_creator} creation_time={duel.creation_time} stake_amount={duel.stake_amount} allPlayers={allPlayers} duel_opponent={duel.duel_opponent} creators_strategy={duel.creators_strategy} opponent_strategy={duel.opponents_strategy} is_completed={duel.is_completed} />)
            ) : <div className=" mt-14 text-center text-white font-belanosima text-xl h-60 py-28"> Awaiting Duel Data...... </div>}
          </div>
        </div>
      </section>
      {/* <DuelComponent /> */}
    </div>
  );
};

export default ListDuels;
