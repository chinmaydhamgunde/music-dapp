import React, { useState, useEffect } from "react";
import { Box, IconButton, Slider, Typography, CardMedia } from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeOff,
  Favorite,
  FavoriteBorder,
  Share,
} from "@mui/icons-material";
import {
  toggleLike,
  incrementShareCount,
  getSongInteractions,
} from "../../services/firebaseService";
import { toast } from "react-toastify";

const PlaybackControls = ({
  audioRef,
  songs,
  currentSong,
  setCurrentSong,
  setAccumulatedTime,
  account,
  contract,
  refreshPlaylists,
  sidebarWidth = 200,
  onInteractionChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);

  // ... (existing useEffect hooks remain the same)

  const toggleMute = () => {
    const audio = audioRef.current;
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    console.log("Current song IPFS audio hash:", currentSong?.ipfsAudioHash);
    if (!currentSong?.ipfsAudioHash) {
      toast.error("No audio file available for this song.");
      setIsPlaying(false);
      return;
    }

    const audioUrl = currentSong.ipfsAudioHash.includes("http")
      ? currentSong.ipfsAudioHash
      : `https://gateway.pinata.cloud/ipfs/${currentSong.ipfsAudioHash}`;
    console.log("Audio URL:", audioUrl);
    audio.src = audioUrl;

    const playAudio = async () => {
      try {
        await audio.load();
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to play audio:", error);
        toast.error(
          "Failed to play audio. Please check the file or try another song."
        );
        setIsPlaying(false);
      }
    };

    playAudio();

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleNext);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleNext);
    };
  }, [currentSong, audioRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setAccumulatedTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, setAccumulatedTime]);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const interactions = await getSongInteractions(currentSong.id);
        setLikesCount(interactions.likes?.length || 0);
        setSharesCount(interactions.shares || 0);
        setLiked(account && interactions.likes?.includes(account));
      } catch (error) {
        console.error("Failed to fetch interactions for current song:", error);
        setLikesCount(0);
        setSharesCount(0);
        setLiked(false);
      }
    };
    if (currentSong) {
      fetchInteractions();
    }
  }, [currentSong, account]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Failed to play audio:", error);
          toast.error("Failed to play audio.");
          setIsPlaying(false);
        });
    }
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const handlePrevious = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
  };

  const handleSliderChange = (event, newValue) => {
    const audio = audioRef.current;
    audio.currentTime = newValue;
    setCurrentTime(newValue);
  };

  const handleVolumeChange = (event, newValue) => {
    const audio = audioRef.current;
    audio.volume = newValue;
    setVolume(newValue);
  };

  const handleLike = async () => {
    if (!account) {
      toast.warn("Please connect your wallet to like a song!");
      return;
    }
    try {
      const isLiked = await toggleLike(currentSong.id, account);
      setLiked(isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      if (onInteractionChange) onInteractionChange();
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to toggle like.");
    }
  };

  const handleShare = async () => {
    try {
      await incrementShareCount(currentSong.id);
      setSharesCount(sharesCount + 1);
      if (onInteractionChange) onInteractionChange();
    } catch (error) {
      console.error("Failed to share song:", error);
      toast.error("Failed to share song.");
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // ... (other existing methods remain the same)

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        ml: `${sidebarWidth}px`,
        background: "linear-gradient(135deg, #2c2c2c, #1a1a1a)",
        backdropFilter: "blur(15px)",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.5)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        p: 2,
        height: 90,
        display: "flex",
        alignItems: "center",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      {/* Song Info Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "30%",
          transition: "all 0.3s ease",
        }}
      >
        <CardMedia
          component="img"
          image={
            currentSong?.ipfsImageHash
              ? `https://gateway.pinata.cloud/ipfs/${currentSong.ipfsImageHash}`
              : "https://via.placeholder.com/50"
          }
          alt="Song Cover"
          sx={{
            width: 60,
            height: 60,
            mr: 2,
            borderRadius: 2,
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        />
        <Box sx={{ overflow: "hidden", width: "calc(100% - 80px)" }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              mb: 0.5,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {currentSong?.name || "Unknown Track"}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.85rem",
              fontStyle: "italic",
            }}
          >
            {currentSong?.artist || "Unknown Artist"}
          </Typography>
        </Box>
      </Box>

      {/* Playback Controls Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 1 }}>
          <IconButton
            onClick={handlePrevious}
            sx={{
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.2)",
                color: "#1db954",
                backgroundColor: "rgba(29,185,84,0.1)",
              },
              borderRadius: "50%",
              p: 1,
            }}
          >
            <SkipPrevious fontSize="medium" />
          </IconButton>
          <IconButton
            onClick={togglePlayPause}
            sx={{
              bgcolor: "#1db954",
              width: 60,
              height: 60,
              borderRadius: "50%",
              boxShadow: "0 4px 15px rgba(29,185,84,0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                bgcolor: "#1ed760",
                boxShadow: "0 4px 20px rgba(29,185,84,0.6)",
              },
            }}
          >
            {isPlaying ? (
              <Pause sx={{ color: "white", fontSize: 32 }} />
            ) : (
              <PlayArrow sx={{ color: "white", fontSize: 32 }} />
            )}
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.2)",
                color: "#1db954",
                backgroundColor: "rgba(29,185,84,0.1)",
              },
              borderRadius: "50%",
              p: 1,
            }}
          >
            <SkipNext fontSize="medium" />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 500,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "white", mr: 2, minWidth: 40, opacity: 0.7 }}
          >
            {formatTime(currentTime)}
          </Typography>
          <Slider
            value={currentTime}
            min={0}
            max={duration || 0}
            onChange={handleSliderChange}
            sx={{
              color: "#1db954",
              height: 6,
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                boxShadow: "0 2px 8px rgba(29,185,84,0.4)",
                "&:hover": {
                  boxShadow: "0 2px 12px rgba(29,185,84,0.6)",
                },
              },
              "& .MuiSlider-rail": {
                opacity: 0.3,
                backgroundColor: "white",
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: "white", ml: 2, minWidth: 40, opacity: 0.7 }}
          >
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Additional Controls Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "30%",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleLike}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.2)",
                backgroundColor: "rgba(29,185,84,0.1)",
              },
            }}
          >
            {liked ? (
              <Favorite sx={{ color: "#1db954" }} />
            ) : (
              <FavoriteBorder sx={{ color: "white" }} />
            )}
          </IconButton>
          <Typography
            variant="caption"
            sx={{ color: "white", minWidth: 20, textAlign: "center" }}
          >
            {likesCount}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleShare}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.2)",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <Share sx={{ color: "white" }} />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ color: "white", minWidth: 20, textAlign: "center" }}
          >
            {sharesCount}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={toggleMute}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.2)",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            {isMuted ? (
              <VolumeOff sx={{ color: "white" }} />
            ) : (
              <VolumeUp sx={{ color: "white" }} />
            )}
          </IconButton>
          <Slider
            value={isMuted ? 0 : volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            sx={{
              width: 100,
              color: "#1db954",
              height: 6,
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                boxShadow: "0 2px 8px rgba(29,185,84,0.4)",
                "&:hover": {
                  boxShadow: "0 2px 12px rgba(29,185,84,0.6)",
                },
              },
              "& .MuiSlider-rail": {
                opacity: 0.3,
                backgroundColor: "white",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PlaybackControls;
