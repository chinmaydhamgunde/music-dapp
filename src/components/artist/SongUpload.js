import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ImageIcon from "@mui/icons-material/Image";
import CategoryIcon from "@mui/icons-material/Category";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Input,
  Paper,
  CircularProgress,
  Chip,
  Fade,
  Backdrop,
  FormHelperText,
  Divider,
} from "@mui/material";

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;
const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const SongUpload = ({ account, contract, web3 }) => {
  const navigate = useNavigate();
  const [songName, setSongName] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  // Preview images
  const [imagePreview, setImagePreview] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");

  const validateInputs = () => {
    const newErrors = {};
    if (!songName.trim()) newErrors.songName = "Song name is required";
    if (!audioFile) newErrors.audioFile = "Audio file is required";
    if (!imageFile) newErrors.imageFile = "Cover image is required";
    if (!category.trim()) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    return interval;
  };

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(PINATA_API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    return response.data.IpfsHash;
  };

  const uploadSong = async () => {
    if (!account || !contract) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);
      const progressInterval = simulateProgress();

      // Upload files to IPFS via Pinata
      const audioHash = await uploadToPinata(audioFile);
      const imageHash = await uploadToPinata(imageFile);

      // Upload metadata to blockchain
      await contract.methods
        .uploadSong(songName, audioHash, imageHash, category)
        .send({ from: account });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        alert("Song uploaded successfully!");

        // Reset form fields
        setSongName("");
        setAudioFile(null);
        setImageFile(null);
        setCategory("");
        setImagePreview(null);
        setAudioFileName("");
        setLoading(false);
        setUploadProgress(0);

        // Navigate back to the songs list
        navigate("/songs");
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      setLoading(false);
      setUploadProgress(0);
      alert("Upload failed: " + error.message);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Box
        sx={{
          p: 4,
          bgcolor: "#0a0a0a",
          ml: "200px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 600,
            bgcolor: "#121212",
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              gutterBottom
              color="white"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #1db954, #21a9af)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
                textAlign: "center",
              }}
            >
              <MusicNoteIcon
                sx={{ mr: 1, verticalAlign: "middle", fontSize: 35 }}
              />
              Upload Your Music
            </Typography>

            <Divider sx={{ mb: 4, bgcolor: "rgba(255,255,255,0.1)" }} />
          </motion.div>

          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <TextField
                label="Song Name"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                variant="outlined"
                fullWidth
                error={!!errors.songName}
                helperText={errors.songName}
                InputProps={{
                  startAdornment: (
                    <MusicNoteIcon sx={{ mr: 1, color: "#1db954" }} />
                  ),
                }}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                  input: { color: "white" },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&:hover fieldset": { borderColor: "#1db954" },
                    "&.Mui-focused fieldset": { borderColor: "#1db954" },
                  },
                }}
              />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <FormControl fullWidth error={!!errors.audioFile}>
                <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                  <MusicNoteIcon
                    sx={{
                      mr: 1,
                      verticalAlign: "middle",
                      fontSize: 18,
                      color: "#1db954",
                    }}
                  />
                  Audio File
                </Typography>

                <Paper
                  sx={{
                    p: 3,
                    border: "2px dashed rgba(255, 255, 255, 0.2)",
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(29, 185, 84, 0.1)",
                      borderColor: "#1db954",
                    },
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={handleAudioChange}
                  />

                  {audioFileName ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MusicNoteIcon sx={{ color: "#1db954", mr: 1 }} />
                      <Typography variant="body2" color="white">
                        {audioFileName}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUploadIcon
                        sx={{ fontSize: 40, color: "#1db954", mb: 1 }}
                      />
                      <Typography variant="body1" color="white">
                        Drag & drop your audio file or click to browse
                      </Typography>
                      <Typography
                        variant="caption"
                        color="rgba(255, 255, 255, 0.5)"
                      >
                        MP3, WAV files accepted
                      </Typography>
                    </Box>
                  )}
                </Paper>
                {errors.audioFile && (
                  <FormHelperText error>{errors.audioFile}</FormHelperText>
                )}
              </FormControl>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <FormControl fullWidth error={!!errors.imageFile}>
                <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                  <ImageIcon
                    sx={{
                      mr: 1,
                      verticalAlign: "middle",
                      fontSize: 18,
                      color: "#1db954",
                    }}
                  />
                  Cover Image
                </Typography>

                <Paper
                  sx={{
                    p: 3,
                    border: "2px dashed rgba(255, 255, 255, 0.2)",
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(29, 185, 84, 0.1)",
                      borderColor: "#1db954",
                    },
                    position: "relative",
                    height: imagePreview ? "180px" : "auto",
                    overflow: "hidden",
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />

                  {imagePreview ? (
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Cover preview"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box>
                      <ImageIcon
                        sx={{ fontSize: 40, color: "#1db954", mb: 1 }}
                      />
                      <Typography variant="body1" color="white">
                        Upload album art
                      </Typography>
                      <Typography
                        variant="caption"
                        color="rgba(255, 255, 255, 0.5)"
                      >
                        JPG, PNG files (Square image recommended)
                      </Typography>
                    </Box>
                  )}
                </Paper>
                {errors.imageFile && (
                  <FormHelperText error>{errors.imageFile}</FormHelperText>
                )}
              </FormControl>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <TextField
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                variant="outlined"
                fullWidth
                placeholder="e.g., Rock, Pop, Hip-Hop, Jazz"
                error={!!errors.category}
                helperText={errors.category}
                InputProps={{
                  startAdornment: (
                    <CategoryIcon sx={{ mr: 1, color: "#1db954" }} />
                  ),
                }}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 2,
                  input: { color: "white" },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                    "&:hover fieldset": { borderColor: "#1db954" },
                    "&.Mui-focused fieldset": { borderColor: "#1db954" },
                  },
                }}
              />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                variant="contained"
                onClick={uploadSong}
                disabled={loading}
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  background:
                    "linear-gradient(90deg, #1db954 0%, #21a9af 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #21a9af 0%, #1db954 100%)",
                  },
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(29, 185, 84, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress
                      size={24}
                      color="inherit"
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ mr: 1 }}
                    />
                    Uploading ({uploadProgress}%)
                  </Box>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ mr: 1 }} />
                    Upload Song
                  </>
                )}
              </Button>
            </motion.div>
          </Box>
        </Paper>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 4,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Your music will be stored on IPFS via Pinata and registered on the
            blockchain
          </Typography>
        </motion.div>
      </Box>

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(4px)",
        }}
        open={loading}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.8)",
            p: 4,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <CircularProgress
            color="success"
            size={60}
            variant="determinate"
            value={uploadProgress}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" color="white">
            Uploading your song
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            {uploadProgress < 50
              ? "Uploading to IPFS..."
              : uploadProgress < 90
              ? "Recording to blockchain..."
              : "Almost done..."}
          </Typography>
        </Box>
      </Backdrop>
    </motion.div>
  );
};

export default SongUpload;
