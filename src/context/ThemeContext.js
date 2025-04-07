import React, { createContext, useState, useEffect, useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { CssBaseline, Button } from "@mui/material";

// Define color palettes
const COLOR_PALETTES = {
  spotify: {
    dark: {
      primary: "#1db954",
      secondary: "#1ed760",
      background: {
        default: "#121212",
        paper: "#181818",
      },
      text: {
        primary: "#ffffff",
        secondary: "#b3b3b3",
      },
    },
    light: {
      primary: "#1db954",
      secondary: "#1ed760",
      background: {
        default: "#f5f5f5",
        paper: "#ffffff",
      },
      text: {
        primary: "#000000",
        secondary: "#666666",
      },
    },
  },
  midnight: {
    dark: {
      primary: "#6a5acd",
      secondary: "#483d8b",
      background: {
        default: "#0f0f1a",
        paper: "#1a1a2e",
      },
      text: {
        primary: "#e6e6fa",
        secondary: "#9090b0",
      },
    },
    light: {
      primary: "#6a5acd",
      secondary: "#483d8b",
      background: {
        default: "#f0f0f8",
        paper: "#ffffff",
      },
      text: {
        primary: "#000030",
        secondary: "#505050",
      },
    },
  },
  ocean: {
    dark: {
      primary: "#00bfff",
      secondary: "#1e90ff",
      background: {
        default: "#0a1128",
        paper: "#10203a",
      },
      text: {
        primary: "#e0f4ff",
        secondary: "#89ceff",
      },
    },
    light: {
      primary: "#00bfff",
      secondary: "#1e90ff",
      background: {
        default: "#e6f2ff",
        paper: "#ffffff",
      },
      text: {
        primary: "#003366",
        secondary: "#006699",
      },
    },
  },
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("dark");
  const [themePalette, setThemePalette] = useState("spotify");

  const theme = useMemo(() => {
    const currentPalette = COLOR_PALETTES[themePalette][themeMode];

    return createTheme({
      palette: {
        mode: themeMode,
        primary: { main: currentPalette.primary },
        secondary: { main: currentPalette.secondary },
        background: currentPalette.background,
        text: currentPalette.text,
      },
      typography: {
        fontFamily: "'Spotify Mix', Roboto, sans-serif",
        h1: {
          fontWeight: 700,
          letterSpacing: "-0.5px",
        },
        h2: {
          fontWeight: 600,
          letterSpacing: "-0.25px",
        },
        body1: {
          lineHeight: 1.6,
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: `
            @font-face {
              font-family: 'Spotify Mix';
              src: local('Spotify Mix');
            }
            body {
              transition: background-color 0.3s ease;
            }
          `,
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(24, 24, 24, 0.8)",
            },
          },
        },
      },
      shape: {
        borderRadius: 12,
      },
      transitions: {
        duration: {
          shorter: 150,
          short: 250,
          standard: 300,
        },
      },
    });
  }, [themeMode, themePalette]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const changePalette = (newPalette) => {
    if (COLOR_PALETTES[newPalette]) {
      setThemePalette(newPalette);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme.palette.background.default;
    document.body.style.color = theme.palette.text.primary;
  }, [theme]);

  const contextValue = {
    themeMode,
    themePalette,
    toggleTheme,
    changePalette,
    availablePalettes: Object.keys(COLOR_PALETTES),
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for easy theme context consumption
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
