import React, { useEffect, useState } from "react";
import readGameState from "../../utils/readState";

interface PopupProps {
    winnerAddress: string;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ winnerAddress, onClose }) => {
  const [duelWinner, setDuelWinner] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const loadWinner = async () => {
      const { Status, request_payload: dPayload } = await readGameState(
        `profile/${winnerAddress}`,
      );
      if (!cancelled && Status && dPayload?.monika) {
        setDuelWinner(dPayload.monika);
      }
    };
    loadWinner();
    return () => {
      cancelled = true;
    };
  }, [winnerAddress]);

  const shortAddress =
    winnerAddress && winnerAddress.length > 12
      ? `${winnerAddress.slice(0, 8)}…${winnerAddress.slice(-6)}`
      : winnerAddress;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative max-w-md w-full mx-4 rounded-2xl border-2 border-myGreen bg-myBlack/95 px-6 sm:px-8 py-8 sm:py-10 shadow-[0_0_35px_rgba(69,248,130,0.5)]">
        <div className="pointer-events-none absolute -top-2 left-8 h-1 w-40 bg-myGreen skew-x-[-35deg]" />
        <div className="pointer-events-none absolute -bottom-2 right-8 h-1 w-40 bg-myGreen skew-x-[-35deg]" />

        <h2 className="relative z-10 text-2xl sm:text-3xl font-belanosima text-center text-white mb-4">
          Battle result
        </h2>
        <p className="relative z-10 text-sm sm:text-base text-gray-300 font-poppins text-center mb-6">
          {duelWinner
            ? `${duelWinner} emerges victorious in this duel.`
            : "A warrior has emerged victorious in this duel."}
        </p>

        <div className="relative z-10 mb-6 rounded-xl border border-gray-700 bg-myBlack/80 px-4 py-3 flex flex-col items-center gap-1">
          <span className="font-belanosima text-xs uppercase tracking-wide text-gray-400">
            Winner address
          </span>
          <span className="font-poppins text-sm sm:text-base text-myGreen">
            {shortAddress}
          </span>
        </div>

        <button
          className="relative z-10 mt-2 w-full inline-flex items-center justify-center rounded-xl bg-myGreen hover:bg-myYellow text-navBg font-belanosima uppercase tracking-wide py-3 sm:py-3.5 text-sm sm:text-base"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
