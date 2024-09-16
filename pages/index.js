import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { ethPrice, ethSupply, setTransactions, setBlocks } from "../store/data";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { ethers } from "ethers";
import Navbar from "../components/navbar";
import "../app/globals.css";
import { IoSearch } from "react-icons/io5";
import { FaEthereum } from "react-icons/fa6";
import { TbWorld } from "react-icons/tb";
import { PiCubeDuotone } from "react-icons/pi";
import { FiFileText } from "react-icons/fi";
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

export default function Index() {
  const dispatch = useDispatch();
  const price = useSelector((state) => state.reducer.ethPrice);
  const supply = useSelector((state) => state.reducer.ethSupply);
  const { address, chainId, isConnected, ethersProvider, signer } =
    useEthereumWallet();
  const provider = new ethers.BrowserProvider(window.ethereum);

  const [balance, setBalance] = useState(0);
  const [tenBlockWithDetails, setTenBlockWithDetails] = useState([]);
  const [currentBlock, setCurrentBlock] = useState([]);
  const [topTenBlock, setTopTenBlock] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const [gasPrice, setGasPrice] = useState(0);

  const accountDetails = async () => {
    try {
      const getCurrentBlock = await provider.getBlockNumber();
      setCurrentBlock(getCurrentBlock);

      const blockTransaction = await provider.getBlock(getCurrentBlock);
      setTransaction(blockTransaction.transactions);

      const prevBlock = getCurrentBlock - 10;
      const topTen = [];
      for (let i = getCurrentBlock; i > prevBlock; i--) {
        topTen.push(i);
      }
      setTopTenBlock(topTen);

      const topTenDetail = [];
      topTen.map(async (item) => {
        const details = await provider.getBlock(item);
        topTenDetail.push(details);
      });
      setTenBlockWithDetails(topTenDetail);

      const gasPrice = await provider.send("eth_gasPrice", []);
      setGasPrice(ethers.formatUnits(gasPrice, "gwei"));
    } catch (error) {
      console.log("something when wrong...", error);
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

  const getBalance = async () => {
    if (isConnected && ethersProvider) {
      try {
        const balance = await ethersProvider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Error fetching balance: ", error);
      }
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

  useEffect(() => {
    dispatch(ethPrice());
    dispatch(ethSupply());
    accountDetails();
  }, [dispatch]);

  if (price === undefined || supply === undefined) {
    return null;
  }

  return (
    <div>
      <Navbar
        isConnected={isConnected}
        address={address}
        connectWallet={connectEthereumWallet}
      />
      <div className="bg-header p-8">
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
      <div className="grid grid-cols-2 justify-center gap-5 p-8">
        <div className="shadow-xl rounded-[15px]  overflow-hidden">
          <p className="font-bold px-5 pt-5 mb-2">Latest Block</p>
          <div className="flex flex-col gap-3 w-full px-5 pb-5 overflow-auto h-[500px]">
            {tenBlockWithDetails?.map((item, index) => (
              <div
                key={index}
                className="grid items-center gap-2 w-full justify-center justify-items-center border-t-[1px] border-gray-300 pt-2"
                style={{ gridTemplateColumns: "auto 120px 1fr" }}
              >
                <PiCubeDuotone className="text-3xl opacity-80" />
                <div>
                  <p className="text-md">{item.number}</p>
                  <p className="text-xs">
                    {timeAgoFromTimestamp(item.timestamp)}
                  </p>
                </div>
                <div>
                  <p className="text-md">
                    Fee Recipient {item.miner.substring(0, 8)}...
                    {item.miner.substr(item.miner.length - 8)}
                  </p>
                  <p className="text-xs">
                    {item.transactions.length} Transactions
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/blocks"
            className="block text-center w-full p-5 bg-gray-200"
          >
            View All Blocks
          </Link>
        </div>
        <div className="shadow-xl rounded-[15px]  overflow-hidden">
          <p className="font-bold px-5 pt-5 mb-2">Latest Block</p>
          <div className="flex flex-col gap-3 shadow-xl rounded-[15px] px-5 pb-5 w-full overflow-auto h-[500px]">
            {transaction
              .filter((_, index) => index < 10)
              .map((item, index) => (
                <div
                  className="grid items-center gap-3 w-full justify-center border-t-[1px] border-gray-300 pt-2"
                  style={{ gridTemplateColumns: "auto 1fr" }}
                >
                  <FiFileText className="text-2xl opacity-80" />
                  <p key={index} className="break-all text-md">
                    {item}
                  </p>
                </div>
              ))}
          </div>
          <Link
            href="/transactions"
            className="text-center block w-full p-5 bg-gray-200"
          >
            View All Transaction
          </Link>
        </div>
      </div>
    </div>
  );
}
