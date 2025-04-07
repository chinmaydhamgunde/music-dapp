import React, { useState } from "react";
import MusicTokenABI from "../../MusicTokenABI.json";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const TipModal = ({ song, contract, account, web3, onClose }) => {
  const [amount, setAmount] = useState("");
  const tokenContract = web3
    ? new web3.eth.Contract(
        MusicTokenABI,
        "0xFF7CbF8CDB2dD6D0074fD4D32aac75cfE884CDae"
      )
    : null; // Replace with MusicToken address

  const approveAndSendTip = async () => {
    if (!amount || !contract || !account || !web3 || !tokenContract) {
      alert(
        "Missing required data. Ensure wallet is connected and amount is set."
      );
      return;
    }

    try {
      const amountWei = web3.utils.toWei(amount, "ether");
      console.log("Approving MusicDapp to spend", amountWei, "tokens...");

      const approveGas = await tokenContract.methods
        .approve(contract.options.address, amountWei)
        .estimateGas({ from: account });
      await tokenContract.methods
        .approve(contract.options.address, amountWei)
        .send({ from: account, gas: (Number(approveGas) * 2).toString() })
        .on("transactionHash", (hash) =>
          console.log("Approval Tx Hash:", hash)
        );

      console.log("Approval successful, sending tip...");

      const tipGas = await contract.methods
        .sendTip(song.id, amountWei)
        .estimateGas({ from: account });
      await contract.methods
        .sendTip(song.id, amountWei)
        .send({ from: account, gas: (Number(tipGas) * 2).toString() })
        .on("transactionHash", (hash) => console.log("Tip Tx Hash:", hash));

      alert(`Sent ${amount} MUSIC tip to artist!`);
      onClose();
    } catch (error) {
      console.error("Tip failed with error:", error);
      let revertReason = "Unknown error";
      if (error.code === 4001) {
        revertReason = "Transaction rejected by user in MetaMask";
      } else if (error.data && error.data.message) {
        revertReason = error.data.message;
      } else if (error.message && error.message.includes("revert")) {
        revertReason =
          "Transaction reverted - check token balance or contract logic";
      }
      alert("Failed to send tip: " + revertReason);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      PaperComponent={motion.div}
      PaperProps={{
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: 0.3 },
        sx: { bgcolor: "background.paper", borderRadius: 2, boxShadow: 24 },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Tip Artist for "{song.name}"</Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Amount in MUSIC"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{ mt: 2, bgcolor: "background.default" }}
          inputProps={{ min: 0, step: "0.1" }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={approveAndSendTip}
          variant="contained"
          color="primary"
          sx={{
            background: "linear-gradient(45deg, #1db954 30%, #21a9af 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #21a9af 30%, #1db954 90%)",
            },
          }}
        >
          Send Tip
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TipModal;
