import React, { useRef, useState, useEffect } from "react";

const Player = ({ songs, currentIndex, setCurrentIndex }) => {
  const audioRef = useRef();
  const currentSong = songs[currentIndex] || {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const formatTime = (time) => {
    if (!time) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const togglePlay = () => {
    setHasInteracted(true);

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Next Song
  const nextSong = () => {
    if (isShuffle) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * songs.length);
      } while (newIndex === currentIndex);

      setCurrentIndex(newIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    }
  };

  const prevSong = () => {
    setCurrentIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
  };

  const handleSeek = (e) => {
    const time = e.target.value;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  useEffect(() => {
    if (audioRef.current && hasInteracted) {
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [currentIndex]);

  // Volume

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;
  };
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#181818",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        padding: "10px",
        justifyContent: "space-between",
      }}
    >
      {/* Song Info */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={currentSong.coverUrl || "https://placehold.co/50"}
          alt=""
          style={{ width: "50px", height: "50px", marginRight: "10px" }}
        />
        <div>{currentSong.title}</div>
      </div>

      {/* Progress */}
      <div style={{ width: "30%" }}>
        {/* Controls */}
        <div>
          <button onClick={prevSong}>⏮</button>
          <button onClick={() => setIsShuffle(!isShuffle)}>
            {isShuffle ? "🔀 ON" : "🔀"}
          </button>
          <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
          <button onClick={nextSong}>⏭</button>
        </div>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          style={{ width: "100%" }}
        />
        <div>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>

      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={nextSong}
      />
    </div>
  );
};

export default Player;
