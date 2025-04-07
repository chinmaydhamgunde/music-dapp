# 🎵 Music Streaming DApp (Prototype v1)

A decentralized music streaming application built on the Ethereum blockchain. Users can upload, play, and interact with songs while earning and distributing MUSIC tokens. This prototype integrates decentralized storage (IPFS), smart contracts, real-time data tracking (Firestore), and a sleek React frontend.

---

## 🚀 Features

- **🎶 Song Upload & Playback**  
  Upload songs to IPFS and stream them with full playback controls (play/pause, next/previous, volume, progress).

- **📊 Song Interactions**  
  Track plays, likes, and shares using Firebase Firestore. Real-time updates on song cards.

- **👥 Listener Dashboard**  
  View total play counts, top listeners, and manage songs/playlists.

- **💰 Token Rewards**  
  Listeners earn MUSIC tokens after 30+ seconds of listening. 50% of tokens go to the artist.

- **📁 Decentralized Storage**  
  Audio and cover images are stored securely on IPFS via Pinata.

- **✨ UI/UX Enhancements**  
  Dark theme with Material-UI, Framer Motion animations, and toast notifications.

---

## 🧱 Tech Stack

- **Frontend:** React, Material-UI, Framer Motion, React Toastify, Web3.js
- **Blockchain:** Solidity (MusicDapp.sol), Ethereum, OpenZeppelin
- **Storage:** IPFS via Pinata
- **Database:** Firebase Firestore
- **Tools:** Node.js, npm, Git

---

## ⚙️ Prerequisites

- Node.js (v14+)
- npm
- MetaMask browser extension
- Firebase account
- Pinata account
- Ethereum testnet (e.g., Sepolia)

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/chinmaydhamgunde/music-dapp
cd music-dapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```
REACT_APP_DAPP_ADDRESS=<deployed-smart-contract-address>
REACT_APP_FIREBASE_API_KEY=<your-firebase-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<your-firebase-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<your-firebase-app-id>
```

### 4. Deploy the Smart Contract

- Use Hardhat or Truffle to deploy MusicDapp.sol to a testnet (e.g., Sepolia).
- Update REACT_APP_DAPP_ADDRESS in .env with the deployed contract address.
- Copy the ABI and save it to src/MusicDappABI.json.

### 5. Set Up Firebase

- Create a Firebase project.
- Enable Firestore and create a songInteractions collection.
- Use your Firebase credentials in the .env file.

### 6. Run the App

```bash
npm start
```

- The app will be available at: http://localhost:3000

### 7. Connect MetaMask

- Connect MetaMask to the Ethereum testnet (e.g., Sepolia).
- Ensure your wallet has testnet ETH (use a faucet if needed).

---

## 🎧 Usage Guide

- **Upload Songs:** Use the smart contract UI to upload songs with IPFS hashes.
- **Stream Songs:** Navigate to the **Songs** tab and click **Play** on a song card.
- **Interact:** Like, share, and view real-time stats for each song.
- **Claim Rewards:** After listening for 30+ seconds, click **Claim Rewards** to earn MUSIC tokens.
- **View Dashboard:** Check your total play count and see top listeners on the **Dashboard**.
