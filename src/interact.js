import MarcCoin from './contracts/MarcCoin.json';
import { ethers } from 'ethers';

const contractABI = MarcCoin.abi;
const contractAddress = "0xde40a751d4B9dCB517E786Ccdb743956825e6dBF";
const ownerAddress = "0x80AA2A78E9b9448a41014EaaD18273De53e03186";


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

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
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
          status: "👆🏽 Write a message in the text-field above.",
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
  // debug code
  if(lotteryBalance < 1000){
    await marcCoinContract.transferFrom(address, ownerAddress, 1);
  }
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
