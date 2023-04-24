import MarcCoin from './contracts/MarcCoin.json';
import { ethers } from 'ethers';

const contractABI = MarcCoin.abi;
export const contractAddress = "0xCeb6B6afc5e25a7A2914fB9Ea505C28d09779914";
export const ownerAddress = "0x79e8A01DDDfCC99Ec4C7dA3b2cF75bCD60A7ACd6";


export async function initializeProvider() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}

  export const loadCurrentBalance = async () => { 
    if (typeof window.ethereum !== 'undefined') {
      const marcCoinContract = await initializeProvider();
      try {
        const balance = await marcCoinContract.balanceOf(ownerAddress); 
        return balance;
      } catch (e) {
        console.log('error fetching total coin balance: ', e);
      }
    }
};

  export const loadCurrentWalletBalance = async (walletAddress, status) => { 
    if (typeof window.ethereum !== 'undefined') {
      const marcCoinContract = await initializeProvider();
      try {
        const balance = await marcCoinContract.balanceOf(walletAddress); 
        if(balance > 0){
          return {newStatus: "❌ Sorry you have already purchased a MarcCoin. Please do not attempt to purchase another and let someone else have a chance at the lottery!", balance: balance};
        }
        return {newStatus: status, balance: balance};
      } catch (e) {
        console.log('error fetching total coin balance: ', e);
      }
    }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👇 Try to connect wallet if it is not connected.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Wallet is connected. Purchase a ticket?",
          addressToUse: undefined
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const purchaseMarcCoin = async (address) => {

  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to purchase a MarcCoin token.",
    };
  }
  const marcCoinContract = await initializeProvider();
  const lotteryBalance = await marcCoinContract.balanceOf(ownerAddress); 
  const currentBalance = await marcCoinContract.balanceOf(address); 
  console.log("Current balance: " + currentBalance);
  if (lotteryBalance === 0) {
    return {
      status: "❌ Sorry the lottery is over.",
    };
  }
  // approve transaction 
  else if(currentBalance >= 1){
    console.log(currentBalance);
    return {
      status: "❌ Sorry you have already purchased a MarcCoin. Please do not attempt to purchase another and let someone else have a chance at the lottery!",
    };
  }
  // await marcCoinContract.approve(ownerAddress, 1);
  //set up transfer
//  const transactionParameters = {
//   to: contractAddress, // Required except during contract publications.
//   from: address, // must match user's active address.
//   data: marcCoinContract.transferFrom(ownerAddress, address, 1)
// };

//sign the transaction
try {
  await marcCoinContract.transferFrom(ownerAddress, address, 1);
  // const txHash = await window.ethereum.request({
  //   method: "eth_sendTransaction",
  //   params: [transactionParameters],
  // });
  return {
    status: (
      <span>
        ✅{"Purchase is being attempted, please wait to receive MarcCoin, your lottery ticket."}
        <br />
        ℹ️ Once the transaction is verified by the network, the message will
        be updated automatically.
      </span>
    ),
  };
} catch (error) {
  return {
    status: "😥 " + error.message,
  };
}
};
