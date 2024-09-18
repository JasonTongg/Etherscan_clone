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
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import Link from "next/link";
import { PiTimerLight } from "react-icons/pi";
import { FaCheckCircle } from "react-icons/fa";
import { LuClock5 } from "react-icons/lu";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { FaAngleDown } from "react-icons/fa6";

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

export default function BlockDetail() {
  const dispatch = useDispatch();
  const [tenBlockWithDetails, setTenBlockWithDetails] = useState([]);
  const [currentBlock, setCurrentBlock] = useState([]);
  const provider = new ethers.BrowserProvider(window.ethereum);
  const { address, chainId, isConnected, ethersProvider, signer } =
    useEthereumWallet();
  const price = useSelector((state) => state.reducer.ethPrice);
  const supply = useSelector((state) => state.reducer.ethSupply);
  const [startIndex, setStartIndex] = useState(0);
  const router = useRouter();
  const { block } = router.query;
  const [latestBlock, setLatestBlock] = useState(0);
  const [tabActive, setTabActive] = useState(0);
  const [expanded, setExpanded] = React.useState(false);
  const [transaction, setTransaction] = useState([]);
  const [search, setSearch] = useState("");

  function checkEthereumInput(input) {
    // Regular expressions to match Ethereum account addresses and transaction hashes
    const accountAddressPattern = /^0x[a-fA-F0-9]{40}$/;
    const transactionHashPattern = /^0x[a-fA-F0-9]{64}$/;
    const blockNumberPattern = /^\d+$/;
    console.log("masuk ga nih?");

    if (accountAddressPattern.test(input)) {
      console.log("account");
      router.push(`/account/${input}`);
    } else if (transactionHashPattern.test(input)) {
      console.log("hash");
      router.push(`/transaction/${input}`);
    } else if (blockNumberPattern.test(+input)) {
      console.log("block");
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
    if (block) {
      try {
        const latestBlock = await provider.getBlockNumber();
        const topTenDetails = await provider.getBlock(+block);
        setTenBlockWithDetails(topTenDetails);
        setLatestBlock(latestBlock);

        const transactionDetails = await Promise.all(
          topTenDetails.transactions.map(async (txHash) => {
            const txDetails = await provider.getTransaction(txHash);
            return txDetails;
          })
        );

        setTransaction(transactionDetails);
        console.log(transactionDetails);
      } catch (error) {
        console.log("something went wrong...", error);
      }
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
  }, [dispatch, block]);

  return (
    <div className="flex flex-col items-center w-full">
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
      <div className="self-start flex gap-4 items-center mt-5 mx-auto w-[95vw]">
        <button
          style={{
            backgroundColor: `${
              tabActive === 0 ? "#1c1f4f" : "rgba(229,231,235)"
            }`,
            color: `${tabActive === 0 ? "white" : "black"}`,
          }}
          className="py-2 px-4 rounded-[5px] transition-all"
          onClick={() => setTabActive(0)}
        >
          Overview
        </button>
        <button
          style={{
            backgroundColor: `${
              tabActive === 1 ? "#1c1f4f" : "rgba(229,231,235)"
            }`,
            color: `${tabActive === 1 ? "white" : "black"}`,
          }}
          className="py-2 px-4 rounded-[5px] transition-all"
          onClick={() => setTabActive(1)}
        >
          Transactions
        </button>
      </div>
      {tenBlockWithDetails && latestBlock ? (
        tabActive === 0 ? (
          <div className="flex flex-col gap-4 shadow-xl overflow-hidden rounded-[15px] p-8 my-5 mx-auto w-[95vw]">
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Block Height:</p>
              <div className="flex gap-2 items-center">
                <p>{tenBlockWithDetails?.number}</p>
                <Link
                  href={`/block/${Number(tenBlockWithDetails?.number) - 1}`}
                  className="bg-gray-200 p-1 rounded-[5px]"
                >
                  <FaAngleLeft />
                </Link>
                <Link
                  href={`/block/${Number(tenBlockWithDetails?.number) + 1}`}
                  className="bg-gray-200 p-1 rounded-[5px]"
                >
                  <FaAngleRight />
                </Link>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Status:</p>
              <p>
                {latestBlock - tenBlockWithDetails?.number > 0 ? (
                  <div className="flex w-fit items-center gap-2 bg-green-100 p-1 px-3 border-[1px] border-gray-300 rounded-[2px]">
                    <FaCheckCircle className="text-green-600" />
                    <p className="text-green-600 font-medium">Finalized</p>
                  </div>
                ) : (
                  <div className="flex w-fit items-center gap-2 bg-gray-200 p-1 px-3 border-[1px] border-gray-300 rounded-[2px]">
                    <PiTimerLight />
                    <p>Unfinalized</p>
                  </div>
                )}
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Timestamp:</p>
              <div className="flex gap-2 items-center">
                <LuClock5 />
                <p>
                  {tenBlockWithDetails?.timestamp
                    ? `${timeAgoFromTimestamp(
                        tenBlockWithDetails?.timestamp
                      )} (${tenBlockWithDetails?.date})`
                    : "Loading..."}
                </p>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Transactions:</p>
              <p className="text-primary-deepBlue cursor-pointer font-medium">
                {tenBlockWithDetails?.transactions?.length} transactions
              </p>
            </div>
            <div className="my-[.5rem] w-[full] h-[1px] bg-gray-200"></div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Fee Recipient:</p>
              <Link
                href={`/account/${tenBlockWithDetails?.miner}`}
                className="text-primary-deepBlue cursor-pointer font-medium"
              >
                {tenBlockWithDetails?.miner}
              </Link>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Total Difficulty:</p>
              <p>
                {(tenBlockWithDetails?.difficulty)
                  .toString()
                  .toLocaleString("en-US")}
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Gas Used:</p>
              <p>
                {Number(tenBlockWithDetails?.gasUsed).toLocaleString("en-US")} (
                {(
                  (Number(tenBlockWithDetails?.gasUsed) /
                    Number(tenBlockWithDetails?.gasLimit)) *
                  100
                ).toFixed(2)}
                %)
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Gas Limit:</p>
              <p>
                {Number(tenBlockWithDetails?.gasLimit).toLocaleString("en-US")}
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "300px 1fr" }}>
              <p className="text-[1.1rem] text-gray-600">Base Fee Per Gas:</p>
              <div className="flex gap-2 items-center">
                <p>
                  {ethers.formatEther(
                    BigInt(Number(tenBlockWithDetails?.baseFeePerGas))
                  )}{" "}
                  ETH
                </p>{" "}
                <p className="text-gray-500">
                  (
                  {ethers.formatUnits(
                    BigInt(Number(tenBlockWithDetails?.baseFeePerGas)),
                    "gwei"
                  )}{" "}
                  Gwei)
                </p>
              </div>
            </div>
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
                  Click to show more
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
                  <p className="text-[1.1rem] text-gray-600">Hash:</p>
                  <p>{tenBlockWithDetails?.hash}</p>
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">Parent Hash:</p>
                  <p>{tenBlockWithDetails?.parentHash}</p>
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">StateRoot:</p>
                  <p>{tenBlockWithDetails?.stateRoot}</p>
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">ReceiptsRoot:</p>
                  <p>{tenBlockWithDetails?.receiptsRoot}</p>
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "300px 1fr" }}
                >
                  <p className="text-[1.1rem] text-gray-600">Nonce:</p>
                  <p>{tenBlockWithDetails?.nonce}</p>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ) : (
          <div className="w-[95vw]">
            <div className="shadow-xl rounded-[15px] overflow-hidden">
              <div className="flex flex-col gap-3 w-full px-5 pb-5 mt-4">
                <div
                  className="grid items-center gap-2 w-full justify-center justify-items-center border-t-[1px] border-gray-300 pt-2"
                  style={{
                    gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  }}
                >
                  <FiFileText className="text-3xl opacity-80" />
                  <p className="text-base font-bold">Transaction Hash</p>
                  <p className="text-base font-bold">Method Hash</p>
                  <p className="text-base font-bold">Block</p>
                  <p className="text-base font-bold">From</p>
                  <p className="text-base font-bold">To</p>
                  <p className="text-base font-bold">Amount (ETH)</p>
                  <p className="text-base font-bold">Txn Fee (ETH)</p>
                </div>
                {transaction
                  .filter(
                    (_, index) =>
                      index >= startIndex && index <= startIndex + 10
                  )
                  ?.map((txDetails, index) => (
                    <div
                      key={index}
                      className="[&>*]:break-all grid items-center gap-2 w-full justify-center justify-items-center border-t-[1px] border-gray-300 pt-2"
                      style={{
                        gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                      }}
                    >
                      <FiFileText className="text-3xl opacity-80" />
                      <Link
                        href={`/transaction/${txDetails?.hash}`}
                        className="cursor-pointer"
                      >
                        {txDetails.hash.substring(0, 5)}...
                        {txDetails.hash.substr(txDetails.hash.length - 5)}
                      </Link>
                      <p> {txDetails.data.slice(0, 10)} </p>
                      <Link
                        href={`/block/${txDetails?.blockNumber}`}
                        className="cursor-pointer"
                      >
                        {txDetails.blockNumber}
                      </Link>
                      <p>
                        {txDetails.from.substring(0, 5)}...
                        {txDetails.from.substr(txDetails.from.length - 5)}
                      </p>
                      <p>
                        {txDetails.to?.substring(0, 5)}...
                        {txDetails.to?.substr(txDetails.to.length - 5) ||
                          "Contract Interaction"}
                      </p>
                      <p>
                        {ethers.formatEther(txDetails.value).length > 10 ||
                        ethers.formatEther(txDetails.value) === "0.0"
                          ? 0
                          : ethers.formatEther(txDetails.value)}{" "}
                        ETH
                      </p>
                      <p className="text-xs text-gray-400">
                        {ethers
                          .formatEther(txDetails.gasPrice)
                          .substring(0, 13)}{" "}
                        ETH
                      </p>
                    </div>
                  ))}
              </div>
              <div className="w-full flex items-center justify-center my-4">
                <Pagination
                  count={Math.ceil(transaction?.length / 10)}
                  onChange={handlePage}
                />
              </div>
            </div>
          </div>
        )
      ) : (
        "Loading..."
      )}
    </div>
  );
}
