import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import SongCard from "../common/SongCard";
import { getSongInteractions } from "../../services/firebaseService";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  styled,
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

// Styled Components
const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  position: "relative",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.mode === "dark" ? "#2c2c2c" : "#f0f0f0",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "#3a3a3a" : "#e6e6e6",
    },
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#4a4a4a" : "#d0d0d0",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: theme.palette.primary.main,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.mode === "dark" ? "#2c2c2c" : "#f0f0f0",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? "#3a3a3a" : "#e6e6e6",
    },
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#4a4a4a" : "#d0d0d0",
    },
  },
}));

const EmptyStateTypography = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
}));

const SongList = ({ songs, onPlay, account, contract }) => {
  const { themeMode } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [songInteractions, setSongInteractions] = useState({});

  const fetchInteractions = async () => {
    if (!account || !contract || !songs.length) return;
    try {
      const interactions = {};
      for (const song of songs) {
        const interactionData = await getSongInteractions(song.id);
        interactions[song.id] = interactionData;
      }
      setSongInteractions(interactions);
    } catch (error) {
      console.error("Failed to fetch song interactions:", error);
      const defaultInteractions = {};
      songs.forEach((song) => {
        defaultInteractions[song.id] = { plays: 0, likes: [], shares: 0 };
      });
      setSongInteractions(defaultInteractions);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, [songs, account, contract]);

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter
      ? song.category === categoryFilter
      : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(songs.map((song) => song.category))];

  return (
    <Box>
      <SearchContainer>
        <StyledTextField
          fullWidth
          variant="outlined"
          label="Search Songs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon color="secondary" style={{ marginRight: 8 }} />
            ),
          }}
        />
        <StyledFormControl>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            startAdornment={
              <FilterListIcon color="secondary" style={{ marginRight: 8 }} />
            }
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>
      </SearchContainer>

      {filteredSongs.length === 0 ? (
        <EmptyStateTypography variant="body1">
          No songs found. Try a different search or category.
        </EmptyStateTypography>
      ) : (
        <Grid container spacing={3}>
          {filteredSongs.map((song) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
              <motion.div
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1 },
                }}
              >
                <SongCard
                  song={song}
                  onPlay={() => {
                    onPlay(song);
                    fetchInteractions();
                  }}
                  interactions={
                    songInteractions[song.id] || {
                      plays: 0,
                      likes: [],
                      shares: 0,
                    }
                  }
                  userAddress={account}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SongList;
