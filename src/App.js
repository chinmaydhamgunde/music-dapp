import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import WalletConnect from "./components/common/WalletConnect";
import Sidebar from "./components/common/Sidebar";
import ArtistDashboard from "./components/artist/ArtistDashboard";
import ListenerDashboard from "./components/listener/ListenerDashboard";
import SongUpload from "./components/artist/SongUpload";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  return (
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <AppContent
            web3={web3}
            account={account}
            setWeb3={setWeb3}
            setAccount={setAccount}
          />
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
};

const AppContent = ({ web3, account, setWeb3, setAccount }) => {
  const location = useLocation();
  const [createPlaylistFunc, setCreatePlaylistFunc] = useState(null);

  return (
    <div style={{ display: "flex" }}>
      {account && (
        <Sidebar
          createPlaylist={
            location.pathname === "/listener" ||
            location.pathname === "/" ||
            location.pathname === "/songs"
              ? createPlaylistFunc
              : null
          }
        />
      )}
      <div style={{ flex: 1 }}>
        {!account ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Music Streaming DApp</h1>
            <WalletConnect setWeb3={setWeb3} setAccount={setAccount} />
          </div>
        ) : (
          <Routes>
            <Route
              path="/upload-song"
              element={<ArtistDashboard account={account} web3={web3} />}
            />
            <Route
              path="/listener"
              element={
                <ListenerDashboard
                  account={account}
                  web3={web3}
                  setCreatePlaylistFunc={setCreatePlaylistFunc}
                />
              }
            />
            <Route
              path="/songs"
              element={
                <ListenerDashboard
                  account={account}
                  web3={web3}
                  setCreatePlaylistFunc={setCreatePlaylistFunc}
                />
              }
            />
            {/* <Route
              path="/upload-song"
              element={<SongUpload account={account} web3={web3} />}
            /> */}
            <Route
              path="/"
              element={
                <ListenerDashboard
                  account={account}
                  web3={web3}
                  setCreatePlaylistFunc={setCreatePlaylistFunc}
                />
              }
            />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default App;
