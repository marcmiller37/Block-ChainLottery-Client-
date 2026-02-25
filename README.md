# Block Chain Lottery Client

A React front-end for a blockchain-based lottery built for **UNR CS705**. Users connect with MetaMask, purchase MarcCoin (lottery tickets), and play the lottery by guessing a number. The winner receives a gift card via an encrypted link.

## Features

- **Wallet connection** — Connect via MetaMask to an Ethereum-compatible network
- **Purchase lottery tickets** — Buy one MarcCoin token per address (one ticket per day until someone wins or tickets run out)
- **Play the lottery** — Enter a number between 0 and 20 and submit to play
- **Test accounts** — Pre-funded test addresses and keys are suggested for users without a wallet (import into MetaMask for the test network)

## Prerequisites

- **Node.js** (v14 or later) and npm
- **MetaMask** (or another Web3 wallet) in your browser
- Access to the network where the MarcCoin contract is deployed (contract address is set in the client)

## Tech Stack

- **React** 18 (Create React App)
- **ethers.js** 5.7 — Ethereum wallet and contract interaction
- **MarcCoin** smart contract — ERC-20–style token and lottery logic

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). The app will reload when you edit files.

### Build for production

```bash
npm run build
```

Output is in the `build` folder, ready to deploy.

### Run tests

```bash
npm test
```

## How to Use

1. **Install MetaMask** — [metamask.io/download](https://metamask.io/download) if you don’t have it.
2. **Connect wallet** — Click “Connect Wallet” and approve the connection in MetaMask. Ensure you’re on the correct network (the one where the MarcCoin contract is deployed).
3. **Purchase a ticket** — Click “Purchase MarcCoin” to receive one lottery ticket (one per address). The button is disabled after you already have a ticket.
4. **Play the lottery** — Enter a number between 0 and 20 and click “Attempt Lottery.” Wait for the transaction to confirm.
5. **Test without a wallet** — Use one of the suggested test address and private key, import the key into MetaMask, then connect and use the app as above.

## Project Structure

```
src/
├── App.js           # Root component, renders MarcCoin
├── MarcCoin.js      # Main UI: wallet, purchase, lottery, test-account hints
├── interact.js      # Web3: contract init, wallet connect, balance, purchase
├── contracts/
│   └── MarcCoin.json  # Contract ABI
└── ...
```

Contract address and owner address are configured in `src/interact.js`.

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm start`    | Development server (port 3000) |
| `npm run build`| Production build               |
| `npm test`     | Run tests                      |
| `npm run eject`| Eject CRA (one-way; not recommended) |

## License

Private — UNR CS705 project.
