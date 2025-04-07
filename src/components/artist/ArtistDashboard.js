import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import MusicDappABI from "../../MusicDappABI.json";
import SongUpload from "./SongUpload";
import "core-js/features/bigint";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Alert,
  CardMedia,
  Chip,
  Avatar,
  Divider,
  Container,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AlbumIcon from "@mui/icons-material/Album";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Fallback for BigInt
const SafeBigInt = typeof BigInt !== "undefined" ? BigInt : Number;

const CONTRACT_ADDRESS = process.env.REACT_APP_DAPP_ADDRESS;
const CONTRACT_DEPLOYMENT_BLOCK = 7962291; // Update with your actual deployment block

const ArtistDashboard = ({ account, web3 }) => {
  const { themeMode } = useContext(ThemeContext);
  const [songs, setSongs] = useState([]);
  const [earnings, setEarnings] = useState({ streaming: 0, tips: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width:900px)");

  const contract = web3
    ? new web3.eth.Contract(MusicDappABI, CONTRACT_ADDRESS)
    : null;

  // Helper function to safely convert BigInt to Number
  const safeBigIntToNumber = (value) => {
    if (typeof value === "bigint") {
      const num = Number(value);
      if (value > Number.MAX_SAFE_INTEGER) {
        console.warn(
          `BigInt value ${value} exceeds Number.MAX_SAFE_INTEGER and may lose precision.`
        );
      }
      return num;
    }
    return value;
  };

  const fetchEventsInChunks = async (eventName, filter, fromBlock, toBlock) => {
    const BLOCK_CHUNK_SIZE = 10000;
    let events = [];
    let currentFromBlock = SafeBigInt(fromBlock);
    const toBlockBigInt = SafeBigInt(toBlock);

    while (currentFromBlock < toBlockBigInt) {
      const currentToBlock = SafeBigInt(
        Math.min(
          safeBigIntToNumber(currentFromBlock) + BLOCK_CHUNK_SIZE - 1,
          safeBigIntToNumber(toBlockBigInt)
        )
      );
      try {
        const chunkEvents = await contract.getPastEvents(eventName, {
          fromBlock: safeBigIntToNumber(currentFromBlock),
          toBlock: safeBigIntToNumber(currentToBlock),
          filter,
        });
        events = events.concat(chunkEvents);
      } catch (err) {
        console.error(`Error fetching ${eventName} events:`, err);
        throw err;
      }
      currentFromBlock = currentToBlock + SafeBigInt(1);
    }
    return events;
  };

  useEffect(() => {
    if (!web3) {
      setError(
        "Web3 is not initialized. Please ensure your wallet is connected."
      );
      setLoading(false);
      return;
    }
    if (!CONTRACT_ADDRESS) {
      setError(
        "Contract address is not set. Check REACT_APP_DAPP_ADDRESS in your .env file."
      );
      setLoading(false);
      return;
    }

    const fetchSongs = async () => {
      if (!contract || !account) return;
      try {
        const songCount = await contract.methods.songCount().call();
        const songList = [];
        for (let i = 1; i <= Number(songCount); i++) {
          const song = await contract.methods.songs(i).call();
          if (song.artist.toLowerCase() === account.toLowerCase()) {
            songList.push({ id: i, ...song });
          }
        }
        setSongs(songList);
      } catch (err) {
        setError("Failed to fetch songs: " + (err.message || "Unknown error"));
      }
    };

    const fetchEarnings = async () => {
      if (!contract || !account) return;
      try {
        const latestBlock = await web3.eth.getBlockNumber();
        const rewardEvents = await fetchEventsInChunks(
          "TokensRewarded",
          { artist: account },
          CONTRACT_DEPLOYMENT_BLOCK,
          latestBlock
        );
        const streamingEarnings = rewardEvents.reduce(
          (total, event) =>
            total + safeBigIntToNumber(event.returnValues?.artistShare || 0),
          0
        );

        const tipEvents = await fetchEventsInChunks(
          "TipSent",
          { artist: account },
          CONTRACT_DEPLOYMENT_BLOCK,
          latestBlock
        );
        const tipEarnings = tipEvents.reduce(
          (total, event) =>
            total + safeBigIntToNumber(event.returnValues?.amount || 0),
          0
        );

        setEarnings({
          streaming: streamingEarnings / 10 ** 18,
          tips: tipEarnings / 10 ** 18,
        });
        setLoading(false);
      } catch (err) {
        setError(
          "Failed to fetch earnings: " + (err.message || "Unknown error")
        );
        setLoading(false);
      }
    };

    fetchSongs();
    fetchEarnings();
  }, [contract, account, web3]);

  const refreshSongs = async () => {
    if (!contract || !account) return;
    try {
      const songCount = await contract.methods.songCount().call();
      const songList = [];
      for (let i = 1; i <= Number(songCount); i++) {
        const song = await contract.methods.songs(i).call();
        if (song.artist.toLowerCase() === account.toLowerCase()) {
          songList.push({ id: i, ...song });
        }
      }
      setSongs(songList);
    } catch (err) {
      setError("Failed to refresh songs: " + (err.message || "Unknown error"));
    }
  };

  const claimEarnings = async () => {
    if (!contract || !account) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      await contract.methods.claimArtistEarnings().send({ from: account });
      alert("Earnings claimed successfully!");
      const latestBlock = await web3.eth.getBlockNumber();
      const rewardEvents = await fetchEventsInChunks(
        "TokensRewarded",
        { artist: account },
        CONTRACT_DEPLOYMENT_BLOCK,
        latestBlock
      );
      const streamingEarnings = rewardEvents.reduce(
        (total, event) =>
          total + safeBigIntToNumber(event.returnValues?.artistShare || 0),
        0
      );
      const tipEvents = await fetchEventsInChunks(
        "TipSent",
        { artist: account },
        CONTRACT_DEPLOYMENT_BLOCK,
        latestBlock
      );
      const tipEarnings = tipEvents.reduce(
        (total, event) =>
          total + safeBigIntToNumber(event.returnValues?.amount || 0),
        0
      );
      setEarnings({
        streaming: streamingEarnings / 10 ** 18,
        tips: tipEarnings / 10 ** 18,
      });
    } catch (err) {
      alert("Failed to claim earnings: " + (err.message || "Unknown error"));
    }
  };

  if (error) {
    return (
      <Box
        sx={{
          ml: 0,
          p: 3,
          minHeight: "100vh",
          background: "linear-gradient(180deg, #1e1e1e 0%, #121212 100%)",
        }}
      >
        <Alert severity="error">
          <Typography variant="h6">Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: 0,
        p: { xs: 1, sm: 2 },
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1e1e1e 0%, #121212 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxWidth="xl" disableGutters>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              mb: 3,
              pt: 2,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="white"
              sx={{ mb: isMobile ? 2 : 0 }}
            >
              Artist Dashboard
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexDirection: isMobile ? "column" : "row",
                width: isMobile ? "100%" : "auto",
                alignItems: isMobile ? "flex-start" : "center",
              }}
            >
              <Chip
                avatar={
                  <Avatar>
                    <AccountCircleIcon />
                  </Avatar>
                }
                label={
                  account
                    ? `${account.slice(0, 6)}...${account.slice(-4)}`
                    : "Not connected"
                }
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "#1db954",
                  marginBottom: isMobile ? 1 : 0,
                  width: isMobile ? "100%" : "auto",
                }}
              />
              <Button
                variant="contained"
                onClick={claimEarnings}
                disabled={earnings.streaming + earnings.tips === 0}
                startIcon={<AttachMoneyIcon />}
                sx={{
                  background:
                    "linear-gradient(45deg, #1db954 30%, #21a9af 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #21a9af 30%, #1db954 90%)",
                  },
                  "&:disabled": {
                    background: "#333333",
                    color: "#888888",
                  },
                  borderRadius: 20,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  py: 0.75,
                  px: 2,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Claim Earnings
              </Button>
            </Box>
          </Box>

          {/* Stats & Earnings Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  bgcolor: "rgba(40, 40, 40, 0.8)",
                  borderRadius: 2,
                  p: 2,
                  height: "100%",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BarChartIcon sx={{ color: "#1db954", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Dashboard Stats
                  </Typography>
                </Box>
                <Divider
                  sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mb: 2 }}
                />
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AlbumIcon sx={{ color: "#1db954", mr: 1.5 }} />
                  <Typography variant="body1" color="white">
                    Total Songs: <strong>{songs.length}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MusicNoteIcon sx={{ color: "#1db954", mr: 1.5 }} />
                  <Typography variant="body1" color="white">
                    Created Content Value:{" "}
                    <strong>
                      {(earnings.streaming + earnings.tips).toFixed(2)} MUSIC
                    </strong>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  bgcolor: "rgba(40, 40, 40, 0.8)",
                  borderRadius: 2,
                  p: 2,
                  height: "100%",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: "#ffb400", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Your Earnings
                  </Typography>
                </Box>
                <Divider
                  sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mb: 2 }}
                />
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={30} sx={{ color: "#1db954" }} />
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(29, 185, 84, 0.1)",
                          borderRadius: 1,
                          textAlign: "center",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="#1db954"
                          gutterBottom
                        >
                          Streaming Revenue
                        </Typography>
                        <Typography
                          variant="h6"
                          color="white"
                          fontWeight="bold"
                        >
                          {earnings.streaming.toFixed(2)} MUSIC
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(255, 180, 0, 0.1)",
                          borderRadius: 1,
                          textAlign: "center",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="#ffb400"
                          gutterBottom
                        >
                          Tips Received
                        </Typography>
                        <Typography
                          variant="h6"
                          color="white"
                          fontWeight="bold"
                        >
                          {earnings.tips.toFixed(2)} MUSIC
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Song Upload */}
          <Box
            sx={{
              bgcolor: "rgba(40, 40, 40, 0.8)",
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              mb: 4,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <SongUpload
              account={account}
              contract={contract}
              refreshSongs={refreshSongs}
            />
          </Box>

          {/* Songs Section */}
          <Box
            sx={{
              bgcolor: "rgba(18, 18, 18, 0.8)",
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <MusicNoteIcon sx={{ color: "#1db954", mr: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="white">
                Your Songs
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: "#1db954" }} />
              </Box>
            ) : songs.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 1,
                }}
              >
                <Typography color="text.secondary">
                  You haven't uploaded any songs yet.
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  Use the upload form above to add your first song.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {songs.map((song) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          bgcolor: "rgba(30, 30, 30, 0.7)",
                          boxShadow: 3,
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: 2,
                          overflow: "hidden",
                          height: "100%",
                        }}
                      >
                        {song.ipfsImageHash ? (
                          <CardMedia
                            component="img"
                            height="180"
                            image={`https://gateway.pinata.cloud/ipfs/${song.ipfsImageHash}`}
                            alt="Song Cover"
                            sx={{ objectFit: "cover" }}
                            onError={(e) =>
                              (e.target.src = "https://via.placeholder.com/180")
                            }
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 180,
                              background:
                                "linear-gradient(45deg, #1e1e1e 30%, #2a2a2a 90%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <MusicNoteIcon
                              sx={{
                                fontSize: 60,
                                color: "rgba(255,255,255,0.2)",
                              }}
                            />
                          </Box>
                        )}
                        <CardContent>
                          <Typography variant="h6" color="white">
                            {song.name || "Unknown Title"}
                          </Typography>
                          <Chip
                            label={song.category || "Uncategorized"}
                            size="small"
                            sx={{
                              mt: 1,
                              bgcolor: "rgba(29, 185, 84, 0.2)",
                              color: "#1db954",
                              borderRadius: 1,
                            }}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Container>
      </motion.div>
    </Box>
  );
};

export default ArtistDashboard;
