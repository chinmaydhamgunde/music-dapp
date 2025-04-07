import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import MusicDappABI from "../../MusicDappABI.json";
import SongList from "./SongList";
import PlaylistManager from "./PlaylistManager";
import PlaybackControls from "../common/PlaybackControls";
import TipModal from "./TipModal";
import ListenerProfile from "./ListenerProfile";
import {
  incrementPlayCount,
  getSongInteractions,
} from "../../services/firebaseService";
import {
  Box,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab,
  useMediaQuery,
  Chip,
  Paper,
  Avatar,
  Divider,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BarChartIcon from "@mui/icons-material/BarChart";

const CONTRACT_ADDRESS = process.env.REACT_APP_DAPP_ADDRESS;

const ListenerDashboard = ({ account, web3, setCreatePlaylistFunc }) => {
  const { themeMode } = useContext(ThemeContext);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [showTipModal, setShowTipModal] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [topListeners, setTopListeners] = useState([]);
  const [totalPlayCount, setTotalPlayCount] = useState(0);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [loadingListeners, setLoadingListeners] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const audioRef = useRef(new Audio());
  const isMobile = useMediaQuery("(max-width:900px)");

  const contract = useMemo(() => {
    return web3 ? new web3.eth.Contract(MusicDappABI, CONTRACT_ADDRESS) : null;
  }, [web3]);

  const fetchSongs = async () => {
    if (!contract || !account) return;
    setLoadingSongs(true);
    try {
      const songCount = await contract.methods.songCount().call();
      console.log("Song count:", songCount);
      const songList = [];
      for (let i = 1; i <= songCount; i++) {
        const song = await contract.methods.songs(i).call();
        console.log(`Song ${i}:`, song);
        songList.push({
          id: i,
          name: song.name || "Unknown Song",
          artist: song.artist || "Unknown Artist",
          ipfsAudioHash: song.ipfsAudioHash || "",
          ipfsImageHash: song.ipfsImageHash || "",
          category: song.category || "Unknown",
        });
      }
      setSongs(songList);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
      toast.error("Failed to fetch songs.");
    } finally {
      setLoadingSongs(false);
    }
  };

  const fetchTopListeners = async () => {
    if (!contract || !account) return;
    setLoadingListeners(true);
    try {
      const rewardEvents = await contract.getPastEvents("TokensRewarded", {
        fromBlock: 0,
        toBlock: "latest",
      });
      const listenersMap = {};
      rewardEvents.forEach((event) => {
        const listener = event.returnValues.listener;
        const amount = Number(event.returnValues.amount);
        listenersMap[listener] = (listenersMap[listener] || 0) + amount;
      });
      const listenerList = Object.keys(listenersMap)
        .map((listener) => ({
          address: listener,
          totalTime: listenersMap[listener] / 10 ** 18,
        }))
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 10);
      setTopListeners(listenerList);
    } catch (error) {
      console.error("Failed to fetch top listeners:", error);
      toast.error("Failed to fetch top listeners.");
    } finally {
      setLoadingListeners(false);
    }
  };

  const fetchTotalPlayCount = async () => {
    try {
      const allInteractions = await getSongInteractions();
      const total = Object.values(allInteractions).reduce(
        (sum, interaction) => {
          return sum + (interaction.plays || 0);
        },
        0
      );
      setTotalPlayCount(total);
    } catch (error) {
      console.error("Failed to fetch total play count:", error);
      toast.error("Failed to fetch total play count.");
      setTotalPlayCount(0);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchTopListeners();
    fetchTotalPlayCount();
  }, [contract, account]);

  useEffect(() => {
    if (!songs.length && !loadingSongs) {
      setSongs([
        {
          id: 1,
          name: "Sample Song",
          artist: "0x1234...5678",
          ipfsAudioHash:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          ipfsImageHash: "",
          category: "Pop",
        },
      ]);
    }
    if (!topListeners.length && !loadingListeners) {
      setTopListeners([
        { address: "0x1234...5678", totalTime: 100 },
        { address: "0x9012...3456", totalTime: 80 },
      ]);
    }
  }, [loadingSongs, loadingListeners]);

  const playSong = async (song) => {
    if (!account) {
      toast.warn("Please connect your wallet first!");
      return;
    }
    if (!song.ipfsAudioHash) {
      toast.error("This song has no audio file available.");
      return;
    }
    try {
      await incrementPlayCount(song.id);
      setCurrentSong(song);
      setCurrentPlaylist([]);
      toast.success(`Now playing: ${song.name}`);
      fetchTotalPlayCount();
    } catch (error) {
      console.error("Failed to play song:", error);
      toast.error("Failed to play song.");
    }
  };

  const playPlaylist = async (playlistSongs) => {
    if (!account) {
      toast.warn("Please connect your wallet first!");
      return;
    }
    if (playlistSongs.length === 0) return;
    if (!playlistSongs[0].ipfsAudioHash) {
      toast.error(
        "The first song in the playlist has no audio file available."
      );
      return;
    }
    try {
      await incrementPlayCount(playlistSongs[0].id);
      setCurrentPlaylist(playlistSongs);
      setCurrentSong(playlistSongs[0]);
      toast.success(`Playing playlist with ${playlistSongs.length} songs`);
      fetchTotalPlayCount();
    } catch (error) {
      console.error("Failed to play playlist:", error);
      toast.error("Failed to play playlist.");
    }
  };

  useEffect(() => {
    if (setCreatePlaylistFunc) {
      setCreatePlaylistFunc(() => createPlaylist);
    }
  }, [contract, account, setCreatePlaylistFunc]);

  const createPlaylist = async () => {
    if (!contract || !account) return;
    const name = prompt("Enter playlist name:");
    if (!name) return;
    try {
      await contract.methods
        .createPlaylist(name, false, false)
        .send({ from: account });
      toast.success("Playlist created successfully!");
    } catch (error) {
      console.error("Failed to create playlist:", error);
      toast.error("Failed to create playlist: " + error.message);
    }
  };

  const claimRewards = async () => {
    if (!contract || !account || !currentSong) return;
    if (accumulatedTime <= 0) {
      toast.warn("No listening time accumulated yet!");
      return;
    }
    try {
      const finalTimeStr = accumulatedTime.toString();
      const gasEstimate = await contract.methods
        .rewardListener(account, finalTimeStr, currentSong.id)
        .estimateGas({ from: account });
      await contract.methods
        .rewardListener(account, finalTimeStr, currentSong.id)
        .send({ from: account, gas: (Number(gasEstimate) * 2).toString() });
      toast.success(
        `Claimed ${accumulatedTime} MUSIC tokens (50% shared with artist)!`
      );
      setAccumulatedTime(0);
      await fetchTopListeners();
    } catch (error) {
      console.error("Reward claim failed:", error);
      toast.error("Failed to claim rewards: " + error.message);
    }
  };

  const refreshPlaylists = async () => {
    if (!contract || !account) return [];
    try {
      const count = await contract.methods.playlistCount(account).call();
      const playlistList = [];
      for (let i = 1; i <= count; i++) {
        const playlist = await contract.methods.playlists(account, i).call();
        const songIds = Array.isArray(playlist.songIds) ? playlist.songIds : [];
        const playlistSongs = songs.filter((song) =>
          songIds.map((id) => id.toString()).includes(song.id.toString())
        );
        playlistList.push({ id: i, ...playlist, songs: playlistSongs });
      }
      return playlistList;
    } catch (error) {
      console.error("Failed to refresh playlists:", error);
      toast.error("Failed to refresh playlists: " + error.message);
      return [];
    }
  };

  return (
    <Box
      sx={{
        ml: 0, // Change this from "ml: isMobile ? 0 : "200px"" to "ml: 0"
        p: { xs: 1, sm: 2 },
        minHeight: "100vh",
        pb: "80px",
        background: "linear-gradient(180deg, #1e1e1e 0%, #121212 100%)",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
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
              Listener Dashboard
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
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  width: isMobile ? "100%" : "auto",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <Button
                  variant="contained"
                  onClick={claimRewards}
                  disabled={accumulatedTime === 0 || !currentSong}
                  startIcon={<MusicNoteIcon />}
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
                  Claim {accumulatedTime}s
                </Button>
                {currentSong && (
                  <Button
                    variant="contained"
                    onClick={() => setShowTipModal(true)}
                    sx={{
                      background:
                        "linear-gradient(45deg, #e86c00 30%, #ff9d00 90%)",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #ff9d00 30%, #e86c00 90%)",
                      },
                      borderRadius: 20,
                      textTransform: "none",
                      fontSize: "0.875rem",
                      py: 0.75,
                      px: 2,
                      width: isMobile ? "100%" : "auto",
                    }}
                  >
                    Tip Artist
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Stats & Top Listeners Section */}
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
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <HeadphonesIcon sx={{ color: "#1db954", mr: 1.5 }} />
                  <Typography variant="body1" color="white">
                    Total Plays: <strong>{totalPlayCount}</strong>
                  </Typography>
                </Box>
                {currentSong && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: "rgba(29, 185, 84, 0.1)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="white">
                      Currently playing: <strong>{currentSong.name}</strong> by{" "}
                      {currentSong.artist}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  bgcolor: "rgba(40, 40, 40, 0.8)",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: "#ffb400", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Top Listeners
                  </Typography>
                </Box>
                <Divider
                  sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mb: 2 }}
                />
                {loadingListeners ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={30} sx={{ color: "#1db954" }} />
                  </Box>
                ) : topListeners.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No listeners data available yet.
                  </Typography>
                ) : (
                  <List sx={{ maxHeight: "200px", overflow: "auto", py: 0 }}>
                    {topListeners.map((listener, index) => (
                      <ListItem
                        key={listener.address}
                        sx={{
                          py: 0.75,
                          px: 1,
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor:
                            index === 0
                              ? "rgba(255, 215, 0, 0.1)"
                              : "transparent",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.05)",
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            mr: 1.5,
                            bgcolor:
                              index === 0
                                ? "#ffb400"
                                : index === 1
                                ? "#c0c0c0"
                                : index === 2
                                ? "#cd7f32"
                                : "#1db954",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" color="white" noWrap>
                              {listener.address.slice(0, 6)}...
                              {listener.address.slice(-4)}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="#1db954"
                              fontWeight="medium"
                            >
                              {listener.totalTime.toFixed(2)} MUSIC
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Tabs Navigation */}
          <Box sx={{ mb: 1 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant={isMobile ? "fullWidth" : "standard"}
              textColor="inherit"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#1db954",
                  height: 3,
                },
              }}
            >
              <Tab
                icon={<MusicNoteIcon />}
                iconPosition="start"
                label="Songs"
                sx={{
                  color: "white",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: tabValue === 0 ? "bold" : "normal",
                  opacity: tabValue === 0 ? 1 : 0.7,
                }}
              />
              <Tab
                icon={<PlaylistAddIcon />}
                iconPosition="start"
                label="Playlists"
                sx={{
                  color: "white",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: tabValue === 1 ? "bold" : "normal",
                  opacity: tabValue === 1 ? 1 : 0.7,
                }}
              />
              <Tab
                icon={<AccountCircleIcon />}
                iconPosition="start"
                label="Profile"
                sx={{
                  color: "white",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: tabValue === 2 ? "bold" : "normal",
                  opacity: tabValue === 2 ? 1 : 0.7,
                }}
              />
            </Tabs>
          </Box>

          {/* Content Area */}
          <Box
            sx={{
              bgcolor: "rgba(18, 18, 18, 0.8)",
              borderRadius: 2,
              p: { xs: 1, sm: 2 },
              minHeight: "400px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            {loadingSongs ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "400px",
                }}
              >
                <CircularProgress sx={{ color: "#1db954" }} />
              </Box>
            ) : (
              <>
                {tabValue === 0 && (
                  <SongList
                    songs={songs}
                    onPlay={playSong}
                    account={account}
                    contract={contract}
                    onInteractionChange={fetchSongs}
                    currentSong={currentSong}
                  />
                )}
                {tabValue === 1 && (
                  <PlaylistManager
                    account={account}
                    contract={contract}
                    songs={songs}
                    onPlayPlaylist={playPlaylist}
                    refreshPlaylists={refreshPlaylists}
                    currentSong={currentSong}
                  />
                )}
                {tabValue === 2 && (
                  <ListenerProfile
                    account={account}
                    contract={contract}
                    songs={songs}
                  />
                )}
              </>
            )}
          </Box>
        </Container>
      </motion.div>

      {currentSong && (
        <PlaybackControls
          audioRef={audioRef}
          songs={currentPlaylist.length > 0 ? currentPlaylist : songs}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          setAccumulatedTime={setAccumulatedTime}
          account={account}
          contract={contract}
          refreshPlaylists={refreshPlaylists}
          sidebarWidth={isMobile ? 0 : 200}
          onInteractionChange={fetchSongs}
        />
      )}
      {showTipModal && (
        <TipModal
          song={currentSong}
          contract={contract}
          account={account}
          web3={web3}
          onClose={() => setShowTipModal(false)}
        />
      )}
    </Box>
  );
};

export default ListenerDashboard;
