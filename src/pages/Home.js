import React, { useState, useEffect } from "react";
import Player from "../components/Player";
import SongList from "../components/SongList";

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  // Fetch songs from backend
  useEffect(() => {
    fetch("http://localhost:5000/songs")
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#121212" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "300px",
          background: "#000",
          color: "#fff",
          overflowY: "auto",
        }}
      >
        <div>
          {songs.map((song, index) => (
            <div
              key={song._id}
              onClick={() => setCurrentIndex(index)}
              style={{
                padding: "10px",
                marginBottom: "8px",
                background: index === currentIndex ? "#1db954" : "#181818",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              <p style={{ margin: 0 }}>{song.title}</p>
              <small>{song.artist}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Setting section in right corner  */}
      <div></div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", color: "#fff" }}>
        <h1>My Music</h1>
      </div>

      {/* Bottom Player */}
      {songs.length > 0 && (
        <Player
          songs={songs}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      )}
    </div>
  );
};

export default Home;
