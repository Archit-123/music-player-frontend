import React from "react";

const SongList = ({ songs, currentIndex, setCurrentIndex }) => {
  return (
    <div>
      <h2 style={{ padding: "10px" }}>Playlist</h2>

      {songs.map((song, index) => (
        <div
          key={index}
          onClick={() => setCurrentIndex(index)}
          style={{
            padding: "10px",
            cursor: "pointer",
            background: currentIndex === index ? "#1db954" : "transparent",
            color: currentIndex === index ? "#000" : "#fff"
          }}
        >
          {song.title}
        </div>
      ))}
    </div>
  );
};

export default SongList;