import { IoWalletOutline } from "react-icons/io5";
import MaxWrapper from "../shared/MaxWrapper";
import { Text } from "../atom/Text";
import { Button } from "../atom/Button";
import { MdOutlineArrowRightAlt } from "react-icons/md";
import { FormEvent, useState, useEffect } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, toWei, createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import fetchNotices from "../../utils/readSubgraph.js";
import { ERC20Portal } from "../../utils/tokenPortal.tsx";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";



const UserActivity = () => {
    const { mutate: sendTransaction } = useSendTransaction();
    const [userAddress, setUserAddress] = useState<string | any>();
    const userAccount = useActiveAccount();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState<any>({});

  // deposit states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState< string>();

  // transfer states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAddress, setTransferAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>();

  // withdraw states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>();

  // NFT transfer states
  const [isNftTransferModalOpen, setIsNftTransferModalOpen] = useState(false);
  const [nftRecipientAddress, setNftRecipientAddress] = useState<string>("");
  const [nftTokenId, setNftTokenId] = useState<number | string>();


  const fetchData = async () => {
    try {
      let request_payload = await fetchNotices("all_profiles");
      request_payload = request_payload.filter(
        (player: any) => player.wallet_address === userAccount?.address.toLowerCase()
      );
      if (request_payload.length > 0) {
        setProfileData(request_payload[0]);
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

  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault();
    try {
        if (!depositAmount || isNaN(Number(depositAmount))) {
          toast.info("Please enter a valid amount.");
          return;
        }
  
        setIsDepositModalOpen(false);
  
        const client = createThirdwebClient({ clientId: "300fad8a1e3799faaef5f0342246ffaf" });
        const contract = getContract({
          client,
          chain: baseSepolia,
          address: ERC20Portal,
        });
  
          const transaction = await prepareContractCall({
            contract,
            method: "function transfer(address to, uint256 value)",
            params: [ERC20Portal, toWei(depositAmount)],
          });
          await sendTransaction(transaction);
          toast.info("Please confirm transaction in your wallet");
      } catch (error) {
        console.error("Error processing deposit:", error);
        toast.error("An error occurred during the transaction.");
      }
  };

  const handleTransfer = async (e: FormEvent) => {
    e.preventDefault();
    //TODO
  };

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
   //TODO
  };

  const handleNftTransfer = (e: FormEvent) => {
    e.preventDefault();
    // logic to transfer
    setNftRecipientAddress("");
    setNftTokenId("");
  };

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  return (
    <MaxWrapper className="relative">
      <section className="w-full flex flex-col gap-10 md:px-20 lg:px-28 px-4 mt-20 mb-10">
        {/* first section */}
        <div className="w-full bg-navBg py-6 px-5 flex flex-col rounded-md">
          <div className="flex flex-col gap-4">
            <div className="w-full flex justify-between items-center">
              <Text as="span" className="flex items-center gap-2 text-gray-400">
                <IoWalletOutline />
                Address
              </Text>
            </div>
            <Text
              as="h4"
              className="text-gray-100 text-lg md:text-2xl font-bold font-poppins"
            >
              {formatAddress(userAddress ? userAddress : "0x00000000000000000000000000000000000")}
            </Text>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {/* Deposit */}
              <Button
                onClick={() => setIsDepositModalOpen(true)}
                type="button"
                className="bg-myGreen text-gray-900 w-full py-2 rounded-md capitalize hover:bg-myYellow flex justify-center items-center gap-1"
              >
                Deposit <MdOutlineArrowRightAlt />
              </Button>
              {/* <!-- Deposit modal --> */}
              <div
                className={`${
                  isDepositModalOpen ? "flex" : "hidden"
                } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
              >
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                  {/* <!-- Modal content --> */}
                  <div className="relative rounded-lg shadow bg-gray-800">
                    {/* <!-- Modal header --> */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Deposit
                      </h3>
                      <button
                        onClick={() => setIsDepositModalOpen(false)}
                        type="button"
                        className="bg-transparent text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                      >
                        <svg
                          className="w-3 h-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 14"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                          />
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>
                    {/* <!-- Modal body --> */}
                    <div className="p-4 md:p-5 space-y-4">
                      <form className="w-full " onSubmit={handleDeposit}>
                        <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-gray-300 after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                          <label
                            htmlFor="amount"
                            className="text-gray-400 font-belanosima"
                          >
                            Amount
                          </label>
                          <input
                            type="text"
                            name="amount"
                            value={depositAmount}
                            onChange={(e) =>
                              setDepositAmount(e.target.value)
                            }
                            placeholder="Enter amount"
                            className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-3 py-3 border border-solid border-gray-300 bg-transparent placeholder:opacity-80 focus:!border-gray-200 focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                            required
                          />
                        </div>

                        {/* <!-- Modal footer --> */}
                        <div className="flex items-center py-4 md:py-5 border-t rounded-b border-gray-600">
                          <Button
                            type="submit"
                            className=" text-[#0f161b] uppercase font-bold tracking-[1px] px-6 py-3 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]"
                          >
                            Deposit Now
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer */}
              <Button
                onClick={() => setIsTransferModalOpen(true)}
                type="button"
                className="bg-myGreen text-gray-900 w-full py-2 rounded-md capitalize hover:bg-myYellow flex justify-center items-center gap-1"
              >
                Transfer <MdOutlineArrowRightAlt />
              </Button>
              {/* <!-- Transfer modal --> */}
              <div
                className={`${
                  isTransferModalOpen ? "flex" : "hidden"
                } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
              >
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                  {/* <!-- Modal content --> */}
                  <div className="relative rounded-lg shadow bg-gray-800">
                    {/* <!-- Modal header --> */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Transfer
                      </h3>
                      <button
                        onClick={() => setIsTransferModalOpen(false)}
                        type="button"
                        className="bg-transparent text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                        data-modal-hide="default-modal"
                      >
                        <svg
                          className="w-3 h-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 14"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                          />
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>
                    {/* <!-- Modal body --> */}
                    <div className="p-4 md:p-5 space-y-4">
                      <form className="w-full " onSubmit={handleTransfer}>
                        <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-gray-300 after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                          <label
                            htmlFor="address"
                            className="text-gray-400 font-belanosima"
                          >
                            Recipient Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={transferAddress}
                            onChange={(e) => setTransferAddress(e.target.value)}
                            placeholder="Enter address"
                            className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-3 py-3 border border-solid border-gray-300 bg-transparent placeholder:opacity-80 focus:!border-gray-200 focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                            required
                          />
                        </div>

                        <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-gray-300 after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                          <label
                            htmlFor="amount"
                            className="text-gray-400 font-belanosima"
                          >
                            Amount
                          </label>
                          <input
                            type="text"
                            name="amount"
                            value={transferAmount}
                            onChange={(e) =>
                              setTransferAmount(e.target.value)
                            }
                            placeholder="Enter amount"
                            className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-3 py-3 border border-solid border-gray-300 bg-transparent placeholder:opacity-80 focus:!border-gray-200 focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                            required
                          />
                        </div>

                        {/* <!-- Modal footer --> */}
                        <div className="flex items-center py-4 md:py-5 border-t rounded-b border-gray-600">
                          <Button
                            type="submit"
                            className=" text-[#0f161b] uppercase font-bold tracking-[1px] px-6 py-3 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]"
                          >
                            Transfer Now
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdraw */}
              <Button
                onClick={() => setIsWithdrawModalOpen(true)}
                type="button"
                className="bg-myGreen text-gray-900 w-full py-2 rounded-md capitalize hover:bg-myYellow flex justify-center items-center gap-1"
              >
                Withdraw <MdOutlineArrowRightAlt />
              </Button>
              {/* <!-- withdraw modal --> */}
              <div
                className={`${
                  isWithdrawModalOpen ? "flex" : "hidden"
                } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
              >
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                  {/* <!-- Modal content --> */}
                  <div className="relative rounded-lg shadow bg-gray-800">
                    {/* <!-- Modal header --> */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Withdraw
                      </h3>

                      <button
                        onClick={() => setIsWithdrawModalOpen(false)}
                        type="button"
                        className="bg-transparent text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                        data-modal-hide="default-modal"
                      >
                        <svg
                          className="w-3 h-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 14"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                          />
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>
                    {/* <!-- Modal body --> */}
                    <div className="p-4 md:p-5 space-y-4">
                      <form className="w-full " onSubmit={handleWithdraw}>
                        <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-gray-300 after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                          <label
                            htmlFor="amount"
                            className="text-gray-400 font-belanosima"
                          >
                            Amount
                          </label>
                          <input
                            type="text"
                            name="amount"
                            value={withdrawAmount}
                            onChange={(e) =>
                              setWithdrawAmount(Number(e.target.value))
                            }
                            placeholder="Enter amount"
                            className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-3 py-3 border border-solid border-gray-300 bg-transparent placeholder:opacity-80 focus:!border-gray-200 focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                            required
                          />
                        </div>

                        {/* <!-- Modal footer --> */}
                        <div className="flex items-center py-4 md:py-5 border-t rounded-b border-gray-600">
                          <Button
                            type="submit"
                            className=" text-[#0f161b] uppercase font-bold tracking-[1px] px-6 py-3 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]"
                          >
                            Withdraw Now
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* NFT Transfer */}
              <Button
                onClick={() => setIsNftTransferModalOpen(true)}
                type="button"
                className="bg-myGreen text-gray-900 w-full py-2 rounded-md capitalize hover:bg-myYellow flex justify-center items-center gap-1"
              >
                NFT Transfer <MdOutlineArrowRightAlt />
              </Button>
              {/* <!-- NFT Transfer modal --> */}
              <div
                className={`${
                  isNftTransferModalOpen ? "flex" : "hidden"
                } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
              >
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                  {/* <!-- Modal content --> */}
                  <div className="relative rounded-lg shadow bg-gray-800">
                    {/* <!-- Modal header --> */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        NFT Transfer
                      </h3>
                      <button
                        onClick={() => setIsNftTransferModalOpen(false)}
                        type="button"
                        className="bg-transparent text-gray-400 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                        data-modal-hide="default-modal"
                      >
                        <svg
                          className="w-3 h-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 14"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                          />
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>
                    {/* <!-- Modal body --> */}
                    <div className="p-4 md:p-5 space-y-4">
                      <form className="w-full " onSubmit={handleNftTransfer}>
                        <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-gray-300 after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                          <label
                            htmlFor="address"
                            className="text-gray-400 font-belanosima"
                          >
                            Recipient Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={nftRecipientAddress}
                            onChange={(e) =>
                              setNftRecipientAddress(e.target.value)
                            }
                            placeholder="Enter address"
                            className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-3 py-3 border border-solid border-gray-300 bg-transparent placeholder:opacity-80 focus:!border-gray-200 focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                            required
                          />
                        </div>

                        <div className="relative mt-0 mb-[30px] mx-0 clip-path-polygon-[100%_0,_100%_calc(100%_-_20px),_calc(100%_-_20px)_100%,_0_100%,_0_0] after:content-[''] after:absolute after:bg-gray-300 after:w-[60px] after:h-px after:right-[-21px] after:-rotate-45 after:bottom-3">
                          <label
                            htmlFor="tokenId"
                            className="text-gray-400 font-belanosima"
                          >
                            Token Id
                          </label>
                          <input
                            type="text"
                            name="tokenId"
                            value={nftTokenId}
                            onChange={(e) =>
                              setNftTokenId(Number(e.target.value))
                            }
                            placeholder="Enter token id"
                            className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-3 py-3 border border-solid border-gray-300 bg-transparent placeholder:opacity-80 focus:!border-gray-200 focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                            required
                          />
                        </div>

                        {/* <!-- Modal footer --> */}
                        <div className="flex items-center py-4 md:py-5 border-t rounded-b border-gray-600">
                          <Button
                            type="submit"
                            className=" text-[#0f161b] uppercase font-bold tracking-[1px] px-6 py-3 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]"
                          >
                            Transfer NFT Now
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* second section */}
        <div className="w-full flex flex-col gap-2">
          <Text
            as="h4"
            className="text-gray-100 text-base md:text-lg font-poppins"
          >
            Your token detail on Nebula
          </Text>
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Balance
              </Text>
              <Text
                as="h1"
                className="text-gray-100 text-2xl md:text-5xl font-bold font-poppins"
              >
                {profileData.nebula_token_balance || 0}
              </Text>
            </div>

            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Spent
              </Text>
              <Text
                as="h1"
                className="text-gray-100 text-2xl md:text-5xl font-bold font-poppins"
              >
                0
              </Text>
            </div>

            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Received
              </Text>
              <Text
                as="h1"
                className="text-gray-100 text-2xl md:text-5xl font-bold font-poppins"
              >
                0
              </Text>
            </div>
          </div>
        </div>

        {/* third section */}
        <div className="w-full flex flex-col gap-2">
          <Text
            as="h4"
            className="text-gray-100 text-base md:text-lg font-poppins"
          >
            Your NFTs
          </Text>
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Balance
              </Text>
              <Text
                as="h1"
                className="text-gray-100 text-2xl md:text-5xl font-bold font-poppins"
              >
                0
              </Text>
            </div>

            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Spent
              </Text>
              <Text
                as="h1"
                className="text-gray-100 text-2xl md:text-5xl font-bold font-poppins"
              >
                0
              </Text>
            </div>

            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Received
              </Text>
              <Text
                as="h1"
                className="text-gray-100 text-2xl md:text-5xl font-bold font-poppins"
              >
                0
              </Text>
            </div>
          </div>
        </div>


      </section>
<Button type="button" onClick={()=> navigate(-1)} className="absolute left-4 top-4 bg-myGreen text-gray-900 px-6 py-2 rounded-md capitalize hover:bg-myYellow">
<HiOutlineArrowNarrowLeft />
</Button>
    </MaxWrapper>
  );
};

export default UserActivity;