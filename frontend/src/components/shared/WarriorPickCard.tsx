/**
 * WarriorPickCard — the game-wide selection card used wherever a player picks
 * characters (duel creation, joining, AI duels, campaign). Campaign design
 * language: dark card, element badge, StatBars, numbered slot + green glow
 * when selected.
 */
import React from "react";
import StatBars from "./StatBars";
import { ELEMENT_META, powerToElement } from "../../utils/campaign";

export interface PickableWarrior {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  super_power: string;
  img?: string;
}

interface Props {
  warrior: PickableWarrior;
  selected: boolean;
  /** 0-based position in the selection (renders 1-based badge); -1 if not selected */
  slot?: number;
  disabled?: boolean;
  onClick: () => void;
  footer?: React.ReactNode;
}

const WarriorPickCard: React.FC<Props> = ({
  warrior,
  selected,
  slot = -1,
  disabled,
  onClick,
  footer,
}) => {
  const element = powerToElement(warrior.super_power);
  const meta = ELEMENT_META[element];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative text-left rounded-xl border-2 bg-myBlack/80 p-2.5 transition-colors flex flex-col ${
        selected
          ? "border-myGreen shadow-[0_0_14px_rgba(69,248,130,0.45)]"
          : "border-gray-800 hover:border-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {selected && slot >= 0 && (
        <span className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-myGreen text-navBg font-belanosima text-xs flex items-center justify-center shadow">
          {slot + 1}
        </span>
      )}
      <div className="card-media rounded-lg mb-2">
        {warrior.img && (
          <img
            src={warrior.img}
            alt={warrior.name}
            className="w-full h-full object-cover"
          />
        )}
        <span
          className={`absolute bottom-1 right-1 text-[9px] rounded-full px-1.5 py-0.5 ${meta.bg} ${meta.color} backdrop-blur-sm`}
          title={warrior.super_power}
        >
          {meta.emoji} {element}
        </span>
      </div>
      <p className="font-belanosima text-white text-xs truncate">{warrior.name}</p>
      <StatBars
        className="mt-1.5"
        stats={{
          health: warrior.health,
          strength: warrior.strength,
          attack: warrior.attack,
          speed: warrior.speed,
        }}
      />
      {footer}
    </button>
  );
};

export default WarriorPickCard;
