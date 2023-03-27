import React from "react";
import { useEffect, useState } from "react";
import {
  initializeProvider,
  connectWallet,
  purchaseMarcCoin,
  loadCurrentBalance,
  getCurrentWalletConnected,
} from "./interact.js";

import chickenlogo from "./grill-chicken.svg";

const MarcCoin = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [balanceInfoMessage, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");

  //called only once
  useEffect(()=> {
    fetchBalance();

    async function fetchWallet() {
      const {address, status} = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status); 
    }
    fetchWallet();
    addWalletListener(); 
    addSmartContractListener();
  }, []);

  async function addSmartContractListener() {
    if (typeof window.ethereum !== 'undefined') {
      const marcCoinContract = await initializeProvider();
      try {
        marcCoinContract.on('Transfer', () => {
            fetchBalance();
            setStatus("🎉 Your ticket has been purchased!");
        });
      } catch (e) {
        setStatus("😥 " + e.message);
      }
    }
  }

  async function fetchBalance() {
    const balanceInfoMessage = await loadCurrentBalance();
    setMessage("Currently available lottery tickets: " + balanceInfoMessage);
    setStatus("You currently own a MarcCoin. Feel free to play the lottery.")
  }


  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write your public key in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onPurchasePressed = async () => {
    const { status } = await purchaseMarcCoin(walletAddress);
    setStatus(status);
};

  const onLotteryPressed = async () => {
    // const { status } = await purchaseMarcCoin(walletAddress);
    // setStatus(status);
};

  //the UI of our component
  return (
    <div id="container">
      <h1 style={{ paddingTop: "50px" }}><center>UNR CS705 Project</center></h1>
      <img id="logo" src={chickenlogo}></img>
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <h2 style={{ paddingTop: "50px" }}>Purchase a lottery ticket once a day until someone wins or we run out of tickets! Winner will receive a giftcard send through an encrypted link.</h2>
      <p>{balanceInfoMessage}</p>

      <h2 style={{ paddingTop: "18px" }}>The prize will be sent encrypted. Please input a public key to decrypt the link. If you do not have one, please click generate key.</h2>
      <button id="lottery" onClick={onLotteryPressed}>
          Attempt Lottery
        </button>
      <div>
        <input
          type="text"
          placeholder="Input your public key for the purchase."
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <p id="status">{status}</p>

        <button id="publish" onClick={onPurchasePressed}>
          Purchase MarcCoin
        </button>
      </div>
    </div>
  );
};

export default MarcCoin;
