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
      {transactionDetail && transactionReceipt && block ? (
        <div>
          <p>Transaction Hash: {transactionDetail?.hash}</p>
          <p>
            Status: {transactionReceipt?.status === 1 ? "Success" : "Failed"}
          </p>
          <p>Block: {transactionDetail?.blockNumber}</p>
          <p>Timestamp: {timeAgoFromTimestamp(block?.timestamp)}</p>
          <p>From: {transactionDetail?.from}</p>
          <p>To: {transactionDetail?.to}</p>
          <p>
            Value:{" "}
            {transactionDetail?.value
              ? ethers?.formatEther(transactionDetail.value)
              : "Loading..."}{" "}
            ETH
          </p>
          <p>
            Transaction Fee:{" "}
            {transactionDetail?.gasPrice && transactionReceipt?.gasUsed
              ? ethers.formatEther(
                  BigInt(
                    Number(transactionDetail?.gasPrice) *
                      Number(transactionReceipt?.gasUsed)
                  )
                ) + " ETH"
              : "Loading..."}
          </p>
          <p>
            Gas Price:{" "}
            {transactionDetail?.gasPrice
              ? ethers?.formatUnits(transactionDetail?.gasPrice, "gwei")
              : "Loading..."}{" "}
            Gwei
          </p>
          <p>Gas Limit: {Number(transactionDetail?.gasLimit)}</p>
          <p>gas Used: {Number(transactionReceipt?.gasUsed)}</p>
          <p>
            Base Gas Fee:{" "}
            {block?.baseFeePerGas
              ? ethers.formatUnits(block?.baseFeePerGas, "gwei") + " Gwei"
              : "Loading..."}
          </p>
          <p>
            Burnt:{" "}
            {block?.baseFeePerGas && transactionReceipt?.gasUsed
              ? ethers.formatEther(
                  BigInt(
                    Number(block?.baseFeePerGas) *
                      Number(transactionReceipt?.gasUsed)
                  )
                ) + " ETH"
              : "loading..."}
          </p>
          <p>Txn Type: {transactionReceipt?.type}</p>
          <p>Nonce: {transactionDetail?.nonce}</p>
          <p>Position in Block: {transactionDetail?.index}</p>
          <p className="break-all">Input Data: {transactionDetail?.data}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
