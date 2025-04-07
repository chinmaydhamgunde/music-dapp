import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Box,
  Divider,
  ListItemIcon,
  alpha,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import HomeIcon from "@mui/icons-material/Home";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import LogoDevIcon from "@mui/icons-material/LogoDev";

const Sidebar = ({ createPlaylist }) => {
  const { themeMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:900px)");

  if (isMobile) {
    return null; // Hide sidebar on mobile - you'll need to create a bottom navigation or drawer menu for mobile
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 200,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 200,
          bgcolor: "#080808", // Slightly darker than dashboard for contrast
          color: "white",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "4px 0px 10px rgba(0, 0, 0, 0.3)",
        },
      }}
      open
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LogoDevIcon sx={{ color: "#1db954", fontSize: 28, mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" color="white" noWrap>
          Web3 Music
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mb: 1 }} />

      {/* Main Navigation */}
      <List sx={{ px: 1 }}>
        <ListItem
          button
          onClick={() => navigate("/")}
          sx={{
            borderRadius: 1.5,
            mb: 0.5,
            backgroundColor: isActive("/")
              ? alpha("#1db954", 0.2)
              : "transparent",
            "&:hover": {
              backgroundColor: isActive("/")
                ? alpha("#1db954", 0.2)
                : "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HomeIcon
              sx={{
                color: isActive("/") ? "#1db954" : "rgba(255, 255, 255, 0.7)",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                color={isActive("/") ? "#1db954" : "white"}
                fontWeight={isActive("/") ? "medium" : "normal"}
              >
                Home
              </Typography>
            }
          />
        </ListItem>
      </List>

      {/* Library Section */}
      <Box sx={{ px: 2, mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <LibraryMusicIcon
            sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 20, mr: 1 }}
          />
          <Typography
            variant="subtitle2"
            color="rgba(255, 255, 255, 0.7)"
            fontWeight="medium"
          >
            YOUR LIBRARY
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 1 }}>
        <ListItem
          button
          onClick={() => navigate("/songs")}
          sx={{
            borderRadius: 1.5,
            mb: 0.5,
            backgroundColor: isActive("/songs")
              ? alpha("#1db954", 0.2)
              : "transparent",
            "&:hover": {
              backgroundColor: isActive("/songs")
                ? alpha("#1db954", 0.2)
                : "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <MusicNoteIcon
              sx={{
                color: isActive("/songs")
                  ? "#1db954"
                  : "rgba(255, 255, 255, 0.7)",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                color={isActive("/songs") ? "#1db954" : "white"}
                fontWeight={isActive("/songs") ? "medium" : "normal"}
              >
                Songs
              </Typography>
            }
          />
        </ListItem>

        <ListItem
          button
          onClick={() => navigate("/upload-song")}
          sx={{
            borderRadius: 1.5,
            mb: 0.5,
            backgroundColor: isActive("/upload-song")
              ? alpha("#1db954", 0.2)
              : "transparent",
            "&:hover": {
              backgroundColor: isActive("/upload-song")
                ? alpha("#1db954", 0.2)
                : "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CloudUploadIcon
              sx={{
                color: isActive("/upload-song")
                  ? "#1db954"
                  : "rgba(255, 255, 255, 0.7)",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                color={isActive("/upload-song") ? "#1db954" : "white"}
                fontWeight={isActive("/upload-song") ? "medium" : "normal"}
              >
                Upload Song
              </Typography>
            }
          />
        </ListItem>

        <ListItem
          button
          onClick={createPlaylist}
          sx={{
            borderRadius: 1.5,
            mb: 0.5,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PlaylistAddIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" color="white">
                Create Playlist
              </Typography>
            }
          />
        </ListItem>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Theme Toggle */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={toggleTheme}
          startIcon={
            themeMode === "light" ? <Brightness4Icon /> : <Brightness7Icon />
          }
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 2,
            textTransform: "none",
            color: "white",
            fontSize: "0.75rem",
            py: 0.75,
            px: 2,
            width: "100%",
            justifyContent: "flex-start",
            "&:hover": {
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          {themeMode === "light" ? "Dark" : "Light"} Mode
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
