import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import {
  ethPrice,
  ethSupply,
  setTransactions,
  setBlocks,
} from "../../store/data";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { ethers } from "ethers";
import Navbar from "../../components/navbar";
import "../../app/globals.css";
import { IoSearch } from "react-icons/io5";
import { FaEthereum } from "react-icons/fa6";
import { TbWorld } from "react-icons/tb";
import { PiCubeDuotone } from "react-icons/pi";
import { FiFileText } from "react-icons/fi";
import Pagination from "@mui/material/Pagination";
import { useRouter } from "next/router";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { FaAngleDown } from "react-icons/fa6";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import Link from "next/link";
import { PiTimerLight } from "react-icons/pi";
import { FaCheckCircle } from "react-icons/fa";
import { LuClock5 } from "react-icons/lu";
import { BsFire } from "react-icons/bs";

const projectId = "d4e79a3bc1f5545a422926acb6bb88b8";

const sepolia = {
  chainId: 11155111, // Chain ID for Sepolia testnet
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://sepolia.infura.io/v3/7501310bfbe94f0fb0f9bf0c190a0a64",
};

const metadata = {
  name: "Tweet App",
  description: "tweet app",
  url: "https://x.com",
  icons: ["https://x.com"],
};

const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [sepolia],
  projectId,
  enableAnalytics: true,
});

function useEthereumWallet() {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const ethersProvider = isConnected
    ? new ethers.BrowserProvider(walletProvider)
    : null;
  const signer = isConnected ? ethersProvider.getSigner() : null;

  return { address, chainId, isConnected, ethersProvider, signer };
}

export default function Transactions() {
  const dispatch = useDispatch();
  const [transactionDetail, setTransactionDetail] = useState([]);
  const provider = new ethers.BrowserProvider(window.ethereum);
  const { address, chainId, isConnected, ethersProvider, signer } =
    useEthereumWallet();
  const price = useSelector((state) => state.reducer.ethPrice);
  const supply = useSelector((state) => state.reducer.ethSupply);
  const [startIndex, setStartIndex] = useState(0);
  const router = useRouter();
  const { transaction } = router.query;
  const [transactionReceipt, setTransactionReceipt] = useState();
  const [block, setBlock] = useState();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  function checkEthereumInput(input) {
    // Regular expressions to match Ethereum account addresses and transaction hashes
    const accountAddressPattern = /^0x[a-fA-F0-9]{40}$/;
    const transactionHashPattern = /^0x[a-fA-F0-9]{64}$/;
    const blockNumberPattern = /^\d+$/;

    if (accountAddressPattern.test(input)) {
      router.push(`/account/${input}`);
    } else if (transactionHashPattern.test(input)) {
      router.push(`/transaction/${input}`);
    } else if (blockNumberPattern.test(+input)) {
      router.push(`/block/${input}`);
    } else {
      console.log("wrong");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("cek " + search);
    checkEthereumInput(search);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const accountDetails = async () => {
    try {
      console.log(transaction);
      const transactionDetails = await provider.getTransaction(transaction);
      setTransactionDetail(transactionDetails);
      console.log(transactionDetails);
      const receipt = await provider.getTransactionReceipt(transaction);
      //   const receipt2 = await provider.getTransactionReceipt(transaction);
      const block = await provider.getBlock(transactionDetails.blockNumber);
      setTransactionReceipt(receipt);
      setBlock(block);
      console.log(receipt);
      console.log(block);
    } catch (error) {
      console.log("something went wrong...", error);
    }
  };

  const connectEthereumWallet = async () => {
    try {
      const instance = await web3Modal.open();
      if (instance) {
        const provider = new ethers.BrowserProvider(instance);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        toast.success("Wallet Connect Successfull", {
          theme: "dark",
        });
      } else {
        throw new Error("No provider returned from Web3Modal.");
      }
    } catch (err) {
      console.error("Ethereum wallet connection failed:", err);
    }
  };

  function timeAgoFromTimestamp(timestamp) {
    // Convert the timestamp to milliseconds
    const timestampInMilliseconds = timestamp * 1000;

    // Get the current time in milliseconds
    const currentTime = Date.now();

    // Calculate the difference in milliseconds
    const timeDifference = currentTime - timestampInMilliseconds;

    // Convert the difference to a more readable format
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Return the result in a human-readable format
    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} mins ago`;
    } else {
      return `${seconds} secs ago`;
    }
  }

  const handlePage = (e, page) => {
    setStartIndex((page - 1) * 10 - 1);
  };

  useEffect(() => {
    dispatch(ethPrice());
    dispatch(ethSupply());
    accountDetails();
  }, [dispatch, transaction]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Navbar
        isConnected={isConnected}
        address={address}
        connectWallet={connectEthereumWallet}
      />
      <div className="bg-header p-8 w-full">
        <div className="flex items-center justify-center gap-8">
          <div className="p-4 rounded-[15px] flex flex-col gap-3">
            <h2 className="text-neutral-lightGray font-medium text-xl">
              The Ethereum Blockchain Explorer
            </h2>
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="search"
                className="bg-neutral-lightGray py-2 px-4 rounded-[10px] flex items-center justify-center gap-2"
              >
                <input
                  type="text"
                  id="search"
                  className="bg-transparent outline-none text-xl w-[400px]"
                  placeholder="Search by Address"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-foreground p-2 rounded-[10px] cursor-pointer"
                  onClick={handleSubmit}
                >
                  <IoSearch className="text-neutral-lightGray text-2xl" />
                </button>
              </label>
            </form>
          </div>
          <div className="bg-neutral-lightGray p-4 rounded-[15px] flex items-center justify-center">
            <div className="flex items-center justify-center gap-2 px-3">
              <FaEthereum className="text-3xl"></FaEthereum>
              <div className="flex justify-center flex-col">
                <p>Eth Price</p>
                <p>${price?.data?.result?.ethusd}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 px-3 border-l-[1px] border-l-neutral-darkCharcoal">
              <TbWorld className="text-3xl"></TbWorld>
              <div className="flex justify-center flex-col">
                <p>Eth Supply</p>
                <p>{supply.data?.result}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {transactionDetail && transactionReceipt && block ? (
        <div className="flex flex-col">
          <div className="flex flex-col gap-4 shadow-xl overflow-hidden rounded-[15px] p-8 my-5 mx-auto w-[95vw]">
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Transaction Hash:</p>
              <div className="flex gap-2 items-center">
                <p>{transactionDetail?.hash}</p>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Status:</p>
              <p>
                {transactionReceipt?.status === 1 ? (
                  <div className="flex w-fit items-center gap-2 bg-green-100 p-1 px-3 border-[1px] border-gray-300 rounded-[2px]">
                    <FaCheckCircle className="text-green-600" />
                    <p className="text-green-600 font-medium">Success</p>
                  </div>
                ) : (
                  <div className="flex w-fit items-center gap-2 bg-red-100 p-1 px-3 border-[1px] border-gray-300 rounded-[2px]">
                    <PiTimerLight className="text-red-600" />
                    <p className="text-red-600 font-medium">Failed</p>
                  </div>
                )}
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Block:</p>
              <p className="text-primary-deepBlue cursor-pointer font-medium">
                {transactionDetail?.blockNumber}
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Timestamp:</p>
              <p className="text-primary-deepBlue cursor-pointer font-medium">
                {timeAgoFromTimestamp(block?.timestamp)}
              </p>
            </div>
            <div className="my-[.5rem] w-[full] h-[1px] bg-gray-200"></div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">From:</p>
              <p>{transactionDetail?.from}</p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">To:</p>
              <p>{transactionDetail?.to}</p>
            </div>
            <div className="my-[.5rem] w-[full] h-[1px] bg-gray-200"></div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Transaction Fee:</p>
              <div className="flex gap-2 items-center">
                <p>
                  {transactionDetail?.gasPrice && transactionReceipt?.gasUsed
                    ? ethers.formatEther(
                        BigInt(
                          Number(transactionDetail?.gasPrice) *
                            Number(transactionReceipt?.gasUsed)
                        )
                      ) + " ETH"
                    : "Loading..."}
                </p>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Gas Price:</p>
              <p>
                {transactionDetail?.gasPrice
                  ? ethers?.formatUnits(transactionDetail?.gasPrice, "gwei")
                  : "Loading..."}{" "}
                Gwei
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 shadow-xl overflow-hidden rounded-[15px] p-8 my-5 mx-auto w-[95vw]">
            <Accordion
              expanded={expanded === "panel4"}
              onChange={handleChange("panel4")}
              sx={{
                backgroundColor: "transparent",
                padding: 0,
                borderBottom: 0,
                boxShadow: 0,
              }}
            >
              <AccordionSummary
                expandIcon={<FaAngleDown />}
                aria-controls="panel4bh-content"
                id="panel4bh-header"
                sx={{
                  backgroundColor: "transparent",
                  padding: 0,
                }}
              >
                <Typography sx={{ width: "33%", flexShrink: 0 }}>
                  {expanded ? "Click to show less" : "Click to show more"}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: "transparent",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">
                    Gas Limit & Usage by Txn:
                  </p>
                  <div className="flex items-center gap-3">
                    <p>{Number(transactionDetail?.gasLimit)}</p>
                    <p className="text-gray-600">|</p>
                    <p>
                      {Number(transactionReceipt?.gasUsed)}{" "}
                      <span>
                        (
                        {(
                          (Number(transactionReceipt?.gasUsed) /
                            Number(transactionDetail?.gasLimit)) *
                          100
                        ).toFixed(2)}
                        %)
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">Gas Fees:</p>
                  <p>
                    <span className="text-[1rem] text-gray-600">Base:</span>{" "}
                    {block?.baseFeePerGas
                      ? ethers.formatUnits(block?.baseFeePerGas, "gwei") +
                        " Gwei"
                      : "Loading..."}
                  </p>
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">Burnt Fee:</p>
                  <div className=" w-fit px-2 py-1 rounded-[5px] bg-gray-100 border-[2px] border-gray-300 flex items-center gap-2">
                    <BsFire className="text-orange-500" />
                    <p>
                      {block?.baseFeePerGas && transactionReceipt?.gasUsed
                        ? ethers.formatEther(
                            BigInt(
                              Number(block?.baseFeePerGas) *
                                Number(transactionReceipt?.gasUsed)
                            )
                          ) + " ETH"
                        : "loading..."}
                    </p>
                  </div>
                </div>
                <div className="my-[.5rem] w-[full] h-[1px] bg-gray-200"></div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">
                    Other Attributes:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className=" w-fit px-2 py-1 rounded-[5px] bg-gray-100 border-[2px] border-gray-300 flex items-center gap-2">
                      <p>Txn Type:</p>
                      <p>{transactionReceipt?.type}</p>
                    </div>
                    <div className=" w-fit px-2 py-1 rounded-[5px] bg-gray-100 border-[2px] border-gray-300 flex items-center gap-2">
                      <p>Nonce:</p>
                      <p>{transactionDetail?.nonce}</p>
                    </div>
                    <div className=" w-fit px-2 py-1 rounded-[5px] bg-gray-100 border-[2px] border-gray-300 flex items-center gap-2">
                      <p>Position in Block:</p>
                      <p>{transactionDetail?.index}</p>
                    </div>
                  </div>
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">Input Data:</p>
                  <textarea
                    className="resize-none bg-gray-100 border-[2px] border-gray-300 p-2 rounded-[5px]"
                    rows={10}
                  >
                    {transactionDetail?.data}
                  </textarea>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
