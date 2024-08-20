import { IoWalletOutline } from "react-icons/io5";
import MaxWrapper from "../shared/MaxWrapper";
import { Text } from "../atom/Text";
import { Button } from "../atom/Button";
import { MdOutlineArrowRightAlt } from "react-icons/md";
import { FormEvent, useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { toWei } from "thirdweb";
// import type { Address } from "viem";
// import { anvil } from "thirdweb/chains";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// import fetchNotices from "../../utils/readSubgraph.js";
import readGameState from "../../utils/readState.tsx";
import {
  ERC20Portal,
  DAPP,
  CTSI,
  ADDRESS_RELAYER,
} from "../../utils/tokenPortal.tsx";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { ethers } from "ethers";
// import { useSendBatchTransaction } from "thirdweb/react";
import signMessages from "../../utils/relayTransaction";
import { fetchVouchers, Voucher } from "../../utils/fetchVouchers";
import { CartesiDApp__factory } from "@cartesi/rollups";

type ExecuteVoucherParams = {
  payload: string;
  destination: string;
  proof: any;
};

const UserActivity = () => {
  //Ethers integration
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  // Page Data's
  const [userAddress, setUserAddress] = useState<string | any>();
  const userAccount = useActiveAccount();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>({});

  // deposit states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>();
  const [isGrantingApproval, setIsGrantingApproval] = useState(false);

  // transfer states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAddress, setTransferAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>();

  // withdraw states
  // withdraw states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // NFT transfer states
  const [isNftTransferModalOpen, setIsNftTransferModalOpen] = useState(false);
  // const [nftRecipientAddress, setNftRecipientAddress] = useState<string>("");
  // const [nftTokenId, setNftTokenId] = useState<number | string>();

  // HANDLE VOUCHERS;
  const [vouchers, setVouchers] = useState<Voucher[] | []>([]);

  useEffect(() => {
    async function loadVouchers() {
      const data: Voucher[] = (await fetchVouchers()) as Voucher[];
      setVouchers(data);
    }
    loadVouchers();
  }, [isNftTransferModalOpen]);

  const executeVoucher = async ({
    payload,
    destination,
    proof,
  }: ExecuteVoucherParams) => {
    if (proof) {
      toast.info("Executing Voucher, Please wait...");

      const dApp = CartesiDApp__factory.connect(DAPP, signer);
      const voucher_execution = await dApp.executeVoucher(
        destination,
        payload,
        proof
      );
      const receipt = voucher_execution.wait();
      // return receipt;

      console.log(receipt);
      // await tx.wait();

      toast.success("Voucher executed successfully....");
    } else {
      console.log(proof);
      toast.error("Voucher not finalised yet......");
    }
  };

  const fetchData = async () => {
    try {
      const { Status, request_payload } = await readGameState(
        `profile/${userAccount?.address}`
      );
      if (Status) {
        setProfileData(request_payload);
      }
      // request_payload = request_payload.filter(
      //   (player: any) =>
      //     player.wallet_address === userAccount?.address.toLowerCase()
      // );
      // if (request_payload.length > 0) {
      //   setProfileData(request_payload[0]);
      // }
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
    console.log("Attempting to deposit transaction");
    try {
      if (!depositAmount || isNaN(Number(depositAmount))) {
        toast.info("Please enter a valid amount.");
        return;
      }

      setIsGrantingApproval(true);
      const abi1 = ["function approve(address receiver, uint256 amount)"];
      const erc20 = new ethers.Contract(CTSI, abi1, signer);
      const tx = await erc20.approve(ERC20Portal, toWei(depositAmount));
      console.log(tx);
      toast.info("Granting Approval please wait...");
      await tx.wait();

      toast.success("Approval granted..... Initiating deposit");
      const abi2 = [
        "function depositERC20Tokens(address token, address dApp, uint256 amount, bytes payload)",
      ];
      const portal = new ethers.Contract(ERC20Portal, abi2, signer);
      const tx2 = await portal.depositERC20Tokens(
        CTSI,
        DAPP,
        depositAmount,
        "0x00000000"
      );
      console.log(tx2);
      await tx2.wait();
      setIsGrantingApproval(false);
      setIsDepositModalOpen(false);
      toast.success("Deposit completed, please refreash page");
    } catch (error) {
      console.error("Error processing deposit:", error);
      toast.error("An error occurred during the transaction.");
    }
  };

  const handleTransfer = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      func: "transfer_tokens",
      trf_amount: Number(transferAmount),
      receiver_add: transferAddress,
    };

    toast.info("Sending Tx to relayer, please wait...");
    await signMessages(payload);

    toast.success("Transfer submitted, please refreash page");
    setIsTransferModalOpen(false);
    setTransferAddress("");
    setTransferAmount("");
  };

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    const { Status, request_payload } = await readGameState(
      `check_relayed_dapp_address`
    );
    const payload = { func: "withdraw", amount: Number(withdrawAmount) };

    if (Status) {
      console.log(request_payload);
      if (request_payload === "rue") {
        toast.info("Sending Tx to relayer, please wait...");
        await signMessages(payload);
        toast.success("Withdrawal submitted, please refreash page");
        setIsWithdrawModalOpen(false);
        setWithdrawAmount("");
        return;
      }
    }

    setIsWithdrawing(true);
    const abi = ["function relayDAppAddress(address _dapp) external"];
    const addressRelayer = new ethers.Contract(ADDRESS_RELAYER, abi, signer);
    const tx = await addressRelayer.relayDAppAddress(DAPP);
    toast.info("Repalying Dapp address, please wait...");
    console.log(tx);
    await tx.wait();

    toast.info("Sending Tx to relayer, please wait...");
    await signMessages(payload);
    toast.success("Withdrawal submitted, please refreash page");
    setIsWithdrawModalOpen(false);
    setIsWithdrawing(false);

    setWithdrawAmount("");
  };

  // const handleNftTransfer = (e: FormEvent) => {
  //   e.preventDefault();
  //   // logic to transfer
  //   // setNftRecipientAddress("");
  //   setNftTokenId("");
  // };

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
              {formatAddress(
                userAddress
                  ? userAddress
                  : "0x00000000000000000000000000000000000"
              )}
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
                        onClick={() => {
                          setIsDepositModalOpen(false);
                          setIsGrantingApproval(false);
                        }}
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
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Enter amount"
                            className=" block w-full text-[#fff] transition-all duration-[0.3s] ease-[ease-out] delay-[0s] px-3 py-3 border border-solid border-gray-300 bg-transparent placeholder:opacity-80 focus:!border-gray-200 focus:!ring-0 focus:!ring-[none] focus:border-solid focus:!outline-offset-0  focus:outline-0"
                            required
                          />
                        </div>

                        {/* <!-- Modal footer --> */}
                        <div className="flex items-center py-4 md:py-5 border-t rounded-b border-gray-600">
                          <Button
                            type="submit"
                            disabled={isGrantingApproval}
                            className=" disabled:bg-green-900 text-[#0f161b] uppercase font-bold tracking-[1px] px-6 py-3 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]"
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
                            onChange={(e) => setTransferAmount(e.target.value)}
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
                        onClick={() => {
                          setIsWithdrawModalOpen(false);
                          setIsWithdrawing(false);
                        }}
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
                            disabled={isWithdrawing}
                            className=" disabled:bg-green-900 text-[#0f161b] uppercase font-bold tracking-[1px] px-6 py-3 border-[none] bg-[#45f882]  font-Barlow hover:bg-[#ffbe18] clip-path-polygon-[100%_0,100%_65%,89%_100%,0_100%,0_0]"
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
                Execute Vouchers <MdOutlineArrowRightAlt />
              </Button>
              {/* <!-- NFT Transfer modal --> */}
              <div
                className={`${
                  isNftTransferModalOpen ? "flex" : "hidden"
                } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
              >
                <div className="relative p-4  max-w-fit max-h-fit  w-fit">
                  {/* <!-- Modal content --> */}
                  <div className="relative rounded-lg shadow bg-gray-800 ma">
                    {/* <!-- Modal header --> */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Available Vouchers
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
                      {/* CHECKING FOR AVAILABLE VOUCHERS TO EXECUTE */}
                      {/* {fetchVouchers()} */}
                      <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Index</th>
                            <th className="py-3 px-6 text-left">Payload</th>
                            <th className="py-3 px-6 text-left">Destination</th>
                            <th className="py-3 px-6 text-left">Claim</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                          {vouchers.map((voucher, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 hover:bg-gray-100"
                            >
                              <td className="py-3 px-6 text-left whitespace-nowrap">
                                {voucher.index}
                              </td>
                              <td className="py-3 px-6 text-left whitespace-nowrap">
                                {`${voucher.payload.slice(0, 15)} 
                                  .....
                                ${voucher.payload.slice(-15)}`}
                              </td>
                              <td className="py-3 px-6 text-left whitespace-nowrap">
                                {`${voucher.destination.slice(0, 8)} 
                                  .....
                                ${voucher.destination.slice(-8)}`}
                              </td>
                              <td className="py-3 px-6 text-left whitespace-nowrap">
                                <Button
                                  onClick={() =>
                                    executeVoucher({
                                      payload: voucher.payload,
                                      destination: voucher.destination,
                                      proof: voucher.proof,
                                    })
                                  }
                                  type="button"
                                  className="bg-myGreen text-gray-900 w-full py-2 rounded-md capitalize hover:bg-myYellow flex justify-center items-center gap-1 p-5"
                                >
                                  Execute <MdOutlineArrowRightAlt />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
            Your CTSI token detail on Nebula
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
                {profileData.cartesi_token_balance || 0}
              </Text>
            </div>

            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Nebula Token Balance
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
                In Game
              </Text>
              <Text
                as="h1"
                className="text-gray-100 text-2xl md:text-5xl font-bold font-poppins"
              >
                {profileData?.characters?.split(",").length}
              </Text>
            </div>

            <div className="w-full bg-navBg py-4 px-4 flex flex-col gap-2 items-start rounded-md">
              <Text as="h6" className="text-gray-400 text-sm">
                Onchain
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
      <Button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 bg-myGreen text-gray-900 px-6 py-2 rounded-md capitalize hover:bg-myYellow"
      >
        <HiOutlineArrowNarrowLeft />
      </Button>
    </MaxWrapper>
  );
};

export default UserActivity;
