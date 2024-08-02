import { useState, useEffect } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, toWei, createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import fetchNotices from "../../utils/readSubgraph.js";
import { ERC20Portal } from "../../utils/tokenPortal.tsx";

const FundAccount = () => {
  const [amount, setAmount] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const { mutate: sendTransaction } = useSendTransaction();
  const [address, setUserAddress] = useState<string | any>();
  const userAccount = useActiveAccount();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      let request_payload = await fetchNotices("all_profiles");
      request_payload = request_payload.filter(
        (player: any) => player.wallet_address === userAccount?.address.toLowerCase()
      );
      if (request_payload.length > 0) {
        // setProfile(request_payload[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const getAllData = async () => {
      await fetchData();
      const address = userAccount?.address;
      if (userAccount && address) {
        setUserAddress(address);
      }
    };

    getAllData();
  }, [userAccount, navigate]);

  const handleDeposit = async () => {
    try {
      if (!amount || isNaN(Number(amount))) {
        toast.info("Please enter a valid amount.");
        return;
      }

      setShowModal(false);

      const client = createThirdwebClient({ clientId: '300fad8a1e3799faaef5f0342246ffaf' });
      const contract = getContract({
        client,
        chain: baseSepolia,
        address: ERC20Portal,
      });

        const transaction = await prepareContractCall({
          contract,
          method: "function transfer(address to, uint256 value)",
          params: [ERC20Portal, toWei(amount)],
        });
        await sendTransaction(transaction);
        toast.info("Please confirm transaction in your wallet");
    } catch (error) {
      console.error("Error processing deposit:", error);
      toast.error("An error occurred during the transaction.");
    }
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="fund-account">
      <h2 className="text-2xl font-bold mb-4"></h2>
      {address && (
        <button
          onClick={handleModalOpen}
          disabled={!userAccount?.address}
          className={`px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 ${!userAccount?.address && "opacity-50 cursor-not-allowed"}`}
        >
          Fund Account
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleModalClose}
            >
              &times;
            </button>
            <h3 className="text-xl text-gray-600 font-bold mb-4">Enter Amount to Deposit</h3>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700 mb-2">
                Amount:
              </label>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in tokens"
                className="w-full px-4 text-gray-700 py-2 border rounded"
              />
            </div>
            <button
              onClick={handleDeposit}
              disabled={!amount}
              className={`w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${!amount && "opacity-50 cursor-not-allowed"}`}
            >
              Deposit Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundAccount;