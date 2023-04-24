import React from "react";
import { useEffect, useState } from "react";
import {
  initializeProvider,
  connectWallet,
  purchaseMarcCoin,
  loadCurrentBalance,
  getCurrentWalletConnected,
  loadCurrentWalletBalance,
  contractAddress, ownerAddress
} from "./interact.js";
import { ethers } from 'ethers';

import chickenlogo from "./grill-chicken.svg";

const accountMap = new Map()
const testAccounts = [
  '0x05113cc29d8ea48c8a954cb5ebaa29374d859bf9',
  '0x204917b6e499a902f6db2f948d092d1ad63d35f4',
  '0x8cecf383880fd9ef425512100cdffeba18e7576a',
  '0x57d0035daa74c282e5165b32a956402afca32227',
  '0x90e379480b28e77fc8d97ce5d5f115c3903692c0',
  '0x7fc7f93f5431acec99216ed340698d6c5b2e06c0',
  '0xc1ce0ecb6b8bc423086f30ffd5d4bac9b75a5dc0',
  '0xce253f007b1e61876b7b3f804b1bab88b761484f']
const testKeys = [
'ee656d4a29d973f7d564e69c4b20d183e80cd605188060618e9647ab92174897',
'7c1ae5d644afb53e2da9085d45e02d7eee8d6f400001822f0400fe295454e085',
'0da7ae0f36478ddaa2c5fd4b346fcb4255d789d285cceb33926649c2a3902d87',
'8cdd41884d43848ea1258c0b9819845df48f5ed27b93164960740e87ea1e23ab',
'0780fbf76dcf44f8635f2a39269c4d802ad2a91604aed4d15b61971b2a977142',
'd8df8d7a8de49c04d41556f8c3491dad2022bf699ee60bb38467c64e21170cd5',
'0ac882c4c99b7f5096e7372aa2d1a3a843acdc86a3523d1635578fd99f194f6d',
'3387f171c881b35e93e2ed3c78a2263a276936995c4d9fc87bd05b08c8e56636',
]

const MarcCoin = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [balanceInfoMessage, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");
  const [largeMessage, setWinningMessage]= useState("Input your lottery guess and press the button below to play.");
  const [addressToUseMessage, setAddressToUseMessage]= useState("You can attempt to play the lottery using the address and private key below. Import the key into Metamask to connect to the test network. If you run into errors, refresh to try a new address.");
  const [addressToUse, setAddressToUse]= useState("");
  const [keyToUse, setKeyToUse]= useState("");
  const [disabled, setDisabled] = useState(false);
  //called only once
  useEffect(()=> {
    createAccountMap();
    outputAccountToUse();
    async function fetchWallet() {
      const {address, status, addressToUse} = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status); 
      const {newStatus, balance} = await loadCurrentWalletBalance(address, status);
      setStatus(newStatus);
      setDisabled(balance > 0);
      if(addressToUse == null){
        setAddressToUseMessage("You do not need an address as you are already connected.")
        setKeyToUse("N/A");
        setAddressToUse("N/A");
      }
    }
    fetchWallet();
    fetchBalance();
    addWalletListener(); 
    addSmartContractListener();

  }, []);

  function createAccountMap() {
    for(let i=0; i<testAccounts.length; i++){
      accountMap.set (testAccounts[i], testKeys[i]);
    }
  }

  async function resetLotteryMessage(){
    const marcCoinContract = await initializeProvider();
    marcCoinContract.resetLotteryMessage();
  }

  async function outputAccountToUse(){
    const availableAccounts = [];
    const usedAddresses = [];
    const marcCoinContract = await initializeProvider();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const latestBlockOnReferesh= await provider.getBlock(-1);
    const latestBlockNumber = latestBlockOnReferesh.number + 1;
    for(let i = 0; i < latestBlockNumber; i++){
      const currentBlock = await provider.getBlockWithTransactions(i);
      const currentUsedAddress = currentBlock.transactions[0]?.from;
      if(currentUsedAddress != null){
        usedAddresses.push(currentBlock.transactions[0]?.from);
      }

    }
     testAccounts.forEach(async(address)=>{
      const balance = await marcCoinContract.balanceOf(address);
      if(balance != null){
        if(balance <1 && !usedAddresses.includes(address)){
          availableAccounts.push(address);
        }
      }
      if(availableAccounts.length >0){
        const addressToUseThisLoad = availableAccounts[Math.floor(Math.random()*availableAccounts.length)];
        const keyToUseThisLoad = accountMap.get(addressToUseThisLoad);
        if(!(addressToUse === "N/A" || addressToUse === "")){
          setAddressToUse(addressToUseThisLoad);
          setKeyToUse(keyToUseThisLoad);
        }

      }

    });
  }

  async function addSmartContractListener() {
    if (typeof window.ethereum !== 'undefined') {
      const marcCoinContract = await initializeProvider();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const latestBlockOnReferesh= await provider.getBlock(-1);
      const blockNumberToIgnore = latestBlockOnReferesh.number + 1;
      try {
        marcCoinContract.on('Transfer', async (from, to, value, event) => {
          const lotteryAddress = await marcCoinContract.getLotteryAddress()
          const addressesToIgnore = [lotteryAddress, '0xCeb6B6afc5e25a7A2914fB9Ea505C28d09779914', '0x79e8A01DDDfCC99Ec4C7dA3b2cF75bCD60A7ACd6'];
          if(event.blockNumber !== blockNumberToIgnore && !addressesToIgnore.includes(to)){
            console.error("from: "+ from);
            console.error("to: "+ to);
            console.error("value: "+ value);
            console.error("event: "+ event);
  
              fetchBalance();
              setStatus("🎉 Your ticket has been purchased!");
          }

        });
        marcCoinContract.on('WinningMessage', (winningMessage)=>{
          setWinningMessage(winningMessage);
          setStatus("🎉 Thanks for playing!");
        });
      } catch (e) {
        setStatus("😥 " + e.message);
      }
    }
  }

  async function fetchBalance() {
    const balanceInfoMessage = await loadCurrentBalance();
    setMessage("Currently available lottery tickets: " + balanceInfoMessage);
  }


  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
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
    const marcCoinContract = await initializeProvider();
    setStatus("Attempting lottery, please wait for the transaction to finalize.")
    await marcCoinContract.playLottery(walletAddress, newMessage);
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
      <h2 style={{ paddingTop: "18px" }}id="addressToUseMessage">{addressToUseMessage}</h2>
      <h3 style={{ paddingTop: "18px" }} id="addressToUse">Try using this address: {addressToUse}</h3>
      <h3 style={{ paddingTop: "18px" }} id="keyToUse">By importing this key: {keyToUse}</h3>
      <h1 style={{ paddingTop: "50px" }} id="winningMessage">{largeMessage}</h1>
      <button id="lottery" onClick={onLotteryPressed}>
          Attempt Lottery
        </button>
      <div>
     <input
          type="text"
          placeholder="Input a number between zero and twenty, then press the button above to play."
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <p id="status">{status}</p>

        <button id="publish" disabled={disabled} onClick={onPurchasePressed}>
          Purchase MarcCoin
        </button>
      </div>
    </div>
  );
};

export default MarcCoin;
