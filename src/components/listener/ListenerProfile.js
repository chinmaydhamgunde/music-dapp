import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Avatar,
  Tooltip,
  styled,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Favorite as FavoriteIcon,
  AccessTime as TimeIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";

// Custom styled components to replace sx
const ProfileBox = styled(Box)(({ theme, mode }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 3,
  background:
    mode === "dark"
      ? "linear-gradient(145deg, #1a1a2e, #16213e)"
      : "linear-gradient(145deg, #f0f0f8, #e6e6f0)",
  boxShadow:
    mode === "dark"
      ? "0 10px 30px rgba(0,0,0,0.3)"
      : "0 10px 30px rgba(0,0,0,0.1)",
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  marginRight: theme.spacing(3),
  background: "linear-gradient(45deg, #1db954, #1ed760)",
  boxShadow: "0 4px 15px rgba(29,185,84,0.4)",
}));

const FavoriteSongsTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

const EmptyStateTypography = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 3,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: theme.shadows[6],
  },
}));

const StyledCardMedia = styled(CardMedia)({
  objectFit: "cover",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const SongNameTypography = styled(Typography)({
  fontWeight: "bold",
  marginBottom: "0.5rem",
});

const ListenerProfile = ({ account, contract, songs }) => {
  const { themeMode } = useContext(ThemeContext);
  const [listeningTime, setListeningTime] = useState(0);
  const [favoritedSongs, setFavoritedSongs] = useState([]);

  // Convert seconds to more readable format
  const formatListeningTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min ${remainingSeconds} sec`;
  };

  useEffect(() => {
    const fetchTime = async () => {
      if (account && contract) {
        const time = await contract.methods.listenerTime(account).call();
        setListeningTime(time.toString());
      }
    };
    const fetchFavorites = async () => {
      if (!contract || !account || !songs) return;
      const favoritesList = [];
      for (let song of songs) {
        const isFavorited = await contract.methods
          .favorites(account, song.id)
          .call();
        if (isFavorited) favoritesList.push(song);
      }
      setFavoritedSongs(favoritesList);
    };
    fetchTime();
    fetchFavorites();
  }, [account, contract, songs]);

  return (
    <ProfileBox mode={themeMode}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <ProfileHeader>
          <StyledAvatar>
            <AccountIcon style={{ fontSize: 40, color: "white" }} />
          </StyledAvatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Listener Profile
            </Typography>
            <Box style={{ display: "flex", gap: 16 }}>
              <Chip
                icon={<AccountIcon />}
                label={
                  account
                    ? `${account.slice(0, 6)}...${account.slice(-4)}`
                    : "Not connected"
                }
                variant="outlined"
                color="primary"
              />
              <Chip
                icon={<TimeIcon />}
                label={`${formatListeningTime(parseInt(listeningTime))}`}
                variant="outlined"
                color="secondary"
              />
            </Box>
          </Box>
        </ProfileHeader>

        {/* Favorited Songs Section */}
        <FavoriteSongsTitle variant="h6" gutterBottom>
          <FavoriteIcon color="error" /> Favorited Songs
        </FavoriteSongsTitle>

        {favoritedSongs.length === 0 ? (
          <EmptyStateTypography color="text.secondary">
            No favorited songs yet. Start exploring music!
          </EmptyStateTypography>
        ) : (
          <Grid container spacing={3}>
            {favoritedSongs.map((song) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <StyledCard>
                    <StyledCardMedia
                      component="img"
                      height="220"
                      image={
                        song.ipfsImageHash
                          ? `https://gateway.pinata.cloud/ipfs/${song.ipfsImageHash}`
                          : "https://via.placeholder.com/220"
                      }
                      alt="Song Cover"
                    />
                    <CardContent>
                      <Tooltip title={song.name} placement="top">
                        <SongNameTypography variant="h6" noWrap>
                          {song.name}
                        </SongNameTypography>
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {song.artist}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>
    </ProfileBox>
  );
};

export default ListenerProfile;
