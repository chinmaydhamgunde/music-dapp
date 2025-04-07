import React from "react";
import Web3 from "web3";
import { Button, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { AccountBalanceWallet } from "@mui/icons-material";

const WalletConnect = ({ setWeb3, setAccount }) => {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Wallet connection failed:", error);
        alert("Failed to connect wallet: " + error.message);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{ display: "inline-block" }}
    >
      <Tooltip title="Connect your MetaMask wallet" arrow>
        <Button
          variant="contained"
          onClick={connectWallet}
          startIcon={<AccountBalanceWallet />}
          sx={{
            background: "linear-gradient(45deg, #1db954 30%, #21a9af 90%)",
            borderRadius: 20,
            textTransform: "none",
            px: 3,
            py: 1.5,
            transition: "background 0.3s ease",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
            "&:hover": {
              background: "linear-gradient(45deg, #21a9af 30%, #1db954 90%)",
            },
          }}
        >
          Connect Wallet
        </Button>
      </Tooltip>
    </motion.div>
  );
};

export default WalletConnect;
