import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import SongCard from "../common/SongCard";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { PlayArrow, Delete } from "@mui/icons-material";

const PlaylistManager = ({
  account,
  contract,
  songs,
  onPlayPlaylist,
  refreshPlaylists,
}) => {
  const { themeMode } = useContext(ThemeContext); // Updated to themeMode
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const fetchPlaylists = async () => {
    if (!contract || !account) return;
    try {
      const playlistList = await refreshPlaylists();
      setPlaylists(playlistList);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
      alert("Failed to fetch playlists: " + error.message);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [contract, account, songs]);

  const createPlaylist = async () => {
    if (!newPlaylistName) {
      alert("Please enter a playlist name!");
      return;
    }
    try {
      await contract.methods
        .createPlaylist(newPlaylistName, false, false)
        .send({ from: account });
      setNewPlaylistName("");
      const playlistList = await refreshPlaylists();
      setPlaylists(playlistList);
    } catch (error) {
      console.error("Failed to create playlist:", error);
      alert("Failed to create playlist: " + error.message);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await contract.methods.deletePlaylist(playlistId).send({ from: account });
      setPlaylists(playlists.filter((p) => p.id !== playlistId));
      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      alert("Failed to delete playlist: " + error.message);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Your Playlists
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="New Playlist Name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            variant="outlined"
            sx={{ flex: 1, bgcolor: "background.default" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={createPlaylist}
            sx={{
              background: "linear-gradient(45deg, #1db954 30%, #21a9af 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #21a9af 30%, #1db954 90%)",
              },
            }}
          >
            Create Playlist
          </Button>
        </Box>

        {playlists.length === 0 ? (
          <Typography color="text.secondary">
            No playlists created yet.
          </Typography>
        ) : (
          <Box>
            <List sx={{ mb: 3 }}>
              {playlists.map((playlist) => (
                <ListItem
                  key={playlist.id}
                  sx={{
                    bgcolor: "background.paper",
                    mb: 1,
                    borderRadius: 1,
                    boxShadow: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemText
                    primary={`${playlist.name} (${playlist.songs.length} songs)`}
                    onClick={() => setSelectedPlaylist(playlist)}
                    sx={{ cursor: "pointer" }}
                  />
                  <IconButton
                    onClick={() => onPlayPlaylist(playlist.songs)}
                    color="primary"
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton
                    onClick={() => deletePlaylist(playlist.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            {selectedPlaylist && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedPlaylist.name}
                </Typography>
                {selectedPlaylist.songs.length === 0 ? (
                  <Typography color="text.secondary">
                    No songs in this playlist.
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {selectedPlaylist.songs.map((song) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={song.id}>
                        <SongCard
                          song={song}
                          onPlay={(s) => onPlayPlaylist([s])}
                          account={account}
                          contract={contract}
                          refreshPlaylists={refreshPlaylists}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        )}
      </motion.div>
    </Box>
  );
};

export default PlaylistManager;
