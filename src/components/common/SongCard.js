import React, { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  Share,
  Headset,
  Album,
  MoreHoriz,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  toggleLike,
  incrementShareCount,
} from "../../services/firebaseService";

const SongCard = ({ song, onPlay, interactions, userAddress, isPlaying }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(
    interactions?.likes?.length || 0
  );
  const [sharesCount, setSharesCount] = useState(interactions?.shares || 0);
  const [playCount, setPlayCount] = useState(interactions?.plays || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize liked state and counts based on interactions
  useEffect(() => {
    if (userAddress && interactions?.likes) {
      setLiked(interactions.likes.includes(userAddress));
      setLikesCount(interactions.likes.length);
    }
    setSharesCount(interactions?.shares || 0);
    setPlayCount(interactions?.plays || 0);

    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [interactions, userAddress]);

  const handleLike = async () => {
    if (!userAddress) {
      console.error("User address not provided. Please connect your wallet.");
      return;
    }

    // Optimistic UI update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      const isLiked = await toggleLike(song.id, userAddress);
      // Adjust if server response differs from our optimistic update
      if (isLiked !== liked) {
        setLiked(isLiked);
        setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(!liked);
      setLikesCount(liked ? likesCount + 1 : likesCount - 1);
      console.error("Failed to toggle like:", error);
    }
  };

  const handleShare = async () => {
    // Optimistic UI update
    setSharesCount(sharesCount + 1);

    try {
      await incrementShareCount(song.id);
    } catch (error) {
      // Revert optimistic update on error
      setSharesCount(sharesCount);
      console.error("Failed to share song:", error);
    }
  };

  // Format the artist address for display
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          bgcolor: "#1E1E1E",
          color: "white",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          height: "100%",
          transition: "all 0.3s ease",
          boxShadow: isHovered
            ? "0 16px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(29, 185, 84, 0.3)"
            : "0 4px 12px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            bgcolor: "#252525",
          },
        }}
      >
        {/* Card top highlight */}
        <Box
          sx={{
            height: 3,
            background: "linear-gradient(90deg, #1db954, #21a9af)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        />

        {/* Image container */}
        <Box sx={{ position: "relative" }}>
          {isLoading ? (
            <Skeleton
              variant="rectangular"
              height={180}
              animation="wave"
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
          ) : (
            <CardMedia
              component="img"
              height={180}
              image={
                song.ipfsImageHash
                  ? `https://gateway.pinata.cloud/ipfs/${song.ipfsImageHash}`
                  : "https://via.placeholder.com/180"
              }
              alt="Song Cover"
              sx={{
                transition: "transform 0.3s ease",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
              }}
            />
          )}

          {/* Play button overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered || isPlaying ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isPlaying
                ? "rgba(0, 0, 0, 0.4)"
                : "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(2px)",
            }}
          >
            <IconButton
              onClick={onPlay}
              sx={{
                bgcolor: "#1db954",
                "&:hover": {
                  bgcolor: "#1ed760",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
                width: 56,
                height: 56,
              }}
            >
              {isPlaying ? (
                <Pause sx={{ color: "white", fontSize: 28 }} />
              ) : (
                <PlayArrow sx={{ color: "white", fontSize: 28 }} />
              )}
            </IconButton>
          </motion.div>

          {/* Category chip */}
          {song.category && (
            <Chip
              icon={<Album sx={{ fontSize: 14 }} />}
              label={song.category}
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                backdropFilter: "blur(4px)",
                fontWeight: "bold",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "& .MuiChip-icon": {
                  color: "#1db954",
                },
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2 }}>
          {isLoading ? (
            <>
              <Skeleton
                variant="text"
                width="80%"
                height={24}
                animation="wave"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", mb: 1 }}
              />
              <Skeleton
                variant="text"
                width="50%"
                height={20}
                animation="wave"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
            </>
          ) : (
            <>
              <Typography
                variant="body1"
                fontWeight="bold"
                noWrap
                sx={{
                  fontSize: "1rem",
                  color: "white",
                  transition: "color 0.2s ease",
                  "&:hover": { color: "#1db954" },
                }}
              >
                {song.name}
              </Typography>
              <Tooltip title={song.artist} placement="top" arrow>
                <Typography
                  variant="caption"
                  color="rgba(255, 255, 255, 0.7)"
                  sx={{ display: "block", mb: 1 }}
                >
                  <Box
                    component="span"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    By {formatAddress(song.artist)}
                  </Box>
                </Typography>
              </Tooltip>
            </>
          )}

          {/* Now playing indicator */}
          {isPlaying && (
            <Box sx={{ width: "100%", mb: 1.5 }}>
              <Typography
                variant="caption"
                color="#1db954"
                sx={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ display: "inline-flex" }}
                >
                  ●
                </motion.div>
                NOW PLAYING
              </Typography>
              <LinearProgress
                variant="indeterminate"
                sx={{
                  height: 2,
                  bgcolor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#1db954",
                  },
                }}
              />
            </Box>
          )}

          {/* Stats Section */}
          {!isLoading && (
            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Tooltip title="Plays" placement="top" arrow>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Headset
                    sx={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    {playCount.toLocaleString()}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Likes" placement="top" arrow>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Favorite
                    sx={{
                      color: liked ? "#1db954" : "rgba(255,255,255,0.7)",
                      fontSize: 16,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={liked ? "#1db954" : "rgba(255,255,255,0.7)"}
                  >
                    {likesCount.toLocaleString()}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Shares" placement="top" arrow>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Share
                    sx={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    {sharesCount.toLocaleString()}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          )}

          {/* Action Buttons */}
          {!isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                pt: 1.5,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <IconButton
                onClick={onPlay}
                size="small"
                sx={{
                  bgcolor: "rgba(29, 185, 84, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(29, 185, 84, 0.2)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {isPlaying ? (
                  <Pause sx={{ color: "#1db954" }} fontSize="small" />
                ) : (
                  <PlayArrow sx={{ color: "#1db954" }} fontSize="small" />
                )}
              </IconButton>

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={handleLike}
                  size="small"
                  sx={{
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  {liked ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                    >
                      <Favorite sx={{ color: "#1db954" }} fontSize="small" />
                    </motion.div>
                  ) : (
                    <FavoriteBorder sx={{ color: "white" }} fontSize="small" />
                  )}
                </IconButton>

                <IconButton
                  onClick={handleShare}
                  size="small"
                  sx={{
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Share sx={{ color: "white" }} fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  sx={{
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <MoreHoriz sx={{ color: "white" }} fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SongCard;
