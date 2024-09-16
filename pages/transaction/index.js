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
import Link from "next/link";

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
  const [tenBlockWithDetails, setTenBlockWithDetails] = useState([]);
  const [currentBlock, setCurrentBlock] = useState([]);
  const [topTenBlock, setTopTenBlock] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const provider = new ethers.BrowserProvider(window.ethereum);
  const { address, chainId, isConnected, ethersProvider, signer } =
    useEthereumWallet();
  const price = useSelector((state) => state.reducer.ethPrice);
  const supply = useSelector((state) => state.reducer.ethSupply);
  const [startIndex, setStartIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const accountDetails = async () => {
    try {
      const getCurrentBlock = await provider.getBlockNumber();

      const blockTransaction = await provider.getBlock(getCurrentBlock);

      const transactionDetails = await Promise.all(
        blockTransaction.transactions.map(async (txHash) => {
          const txDetails = await provider.getTransaction(txHash);
          return txDetails;
        })
      );
      setTransaction(transactionDetails);
      console.log(transactionDetails);
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
  }, [dispatch]);

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
            <label
              htmlFor="search"
              className="bg-neutral-lightGray py-2 px-4 rounded-[10px] flex items-center justify-center gap-2"
            >
              <input
                type="text"
                id="search"
                className="bg-transparent outline-none text-xl w-[400px]"
                placeholder="Search by Address"
              />
              <div className="bg-foreground p-2 rounded-[10px]">
                <IoSearch className="text-neutral-lightGray text-2xl" />
              </div>
            </label>
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
                (_, index) => index >= startIndex && index <= startIndex + 10
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
                    {ethers.formatEther(txDetails.gasPrice).substring(0, 13)}{" "}
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
    </div>
  );
}
