import React from "react";
import { LiaEthereum } from "react-icons/lia";
import Link from "next/link";

export default function navbar({ isConnected, address, connectWallet }) {
  return (
    <div className="bg-header2 flex items-center justify-between w-full px-20 gap-5 py-5">
      <Link
        href="/"
        className="flex items-center justify-center gap-3 [&>*]:text-neutral-lightGray"
      >
        <LiaEthereum className="text-5xl" />
        <p className="text-2xl">Etherscan Clone</p>
      </Link>
      {isConnected ? (
        <p className="text-xl text-neutral-lightGray">
          {address.substring(0, 8)}...{address.substr(address.length - 8)}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-neutral-lightGray text-neutral-darkCharcoal px-4 py-2 rounded-[15px] text-xl"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
