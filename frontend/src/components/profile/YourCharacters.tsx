import { Text } from "../atom/Text";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import fetchNotices from "../../utils/readSubgraph";
import charactersdata from "../../utils/Charactersdata";
import StatBars from "../shared/StatBars";
import { ELEMENT_META, powerToElement } from "../../utils/campaign";

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
  img?: string;
}

const YourCharacters = () => {
  const location = useLocation();
  const activeAccount = useActiveAccount();
  const [roster, setRoster] = useState<CharacterDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharacters() {
      setLoading(true);
      const request_payload = await fetchNotices("all_characters");
      const mine = (Array.isArray(request_payload) ? request_payload : [])
        .filter(
          (c: CharacterDetails) =>
            c.owner === activeAccount?.address?.toLowerCase(),
        )
        .map((c: CharacterDetails) => ({
          ...c,
          img: charactersdata.find((d) => d.name === c.name)?.img,
        }));
      setRoster(mine);
      setLoading(false);
    }
    fetchCharacters();
  }, [location, activeAccount?.address]);

  return (
    <section className="w-full min-h-screen">
      <main className="container-game section flex flex-col gap-2">
        <p className="font-belanosima uppercase tracking-[0.4em] text-myGreen text-xs text-center">
          Your roster
        </p>
        <Text
          as="h2"
          className="font-belanosima text-center uppercase lg:text-4xl md:text-3xl text-2xl text-white"
        >
          All your warriors
        </Text>
        <p className="text-gray-400 font-poppins text-sm text-center max-w-lg mx-auto mb-8">
          Every fighter you own — battle-hardened stats, element and record.
          List them on the marketplace or march them into the campaign.
        </p>

        {loading ? (
          <p className="text-center text-myGreen font-belanosima animate-pulse py-16">
            Mustering your warriors…
          </p>
        ) : roster.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-poppins text-sm mb-4">
              You don't own any warriors yet.
            </p>
            <Link
              to="/profile/purchasecharacter"
              className="inline-block rounded-xl btn-glow font-belanosima uppercase text-sm px-8 py-3"
            >
              Recruit your first squad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {roster.map((item) => {
              const element = powerToElement(item.super_power);
              const meta = ELEMENT_META[element];
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-800 bg-myBlack/80 overflow-hidden hover:border-myGreen/60 transition-colors lift flex flex-col"
                >
                  <div className="card-media">
                    {item.img && (
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span
                      className={`absolute top-2 right-2 text-[10px] rounded-full px-2 py-0.5 ${meta.bg} ${meta.color} backdrop-blur-sm`}
                      title={item.super_power}
                    >
                      {meta.emoji} {element}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-belanosima text-white text-sm truncate">
                        {item.name}
                      </p>
                      <span className="text-[10px] text-gray-500 font-poppins shrink-0">
                        #{item.id}
                      </span>
                    </div>
                    <StatBars
                      size="sm"
                      stats={{
                        health: item.health,
                        strength: item.strength,
                        attack: item.attack,
                        speed: item.speed,
                      }}
                    />
                    <div className="mt-auto pt-1.5 flex items-center justify-between border-t border-gray-800">
                      <p className="text-[10px] text-gray-400 font-poppins">
                        ⚔️ {item.total_wins}W / {item.total_losses}L
                      </p>
                      <p className={`text-[11px] font-poppins ${meta.color}`}>
                        ⚡ {item.super_power}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </section>
  );
};

export default YourCharacters;
