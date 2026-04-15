import { useRef, useState, useEffect } from "react";

const Player = ({ songs, currentIndex, setCurrentIndex }) => {
  const audioRef = useRef();
  const currentSong = songs[currentIndex] || {};

  const [isPlaying, setIsPlaying] = useState(false);
  // const [hasInteracted, setHasInteracted] = useState(false);
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
    // setHasInteracted(true);

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying((prev) => !prev);
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
    if (audioRef.current) {
      audioRef.current.load();

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // autoplay blocked — do nothing
          });
      }

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
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: "95%",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(20,20,20,0.65)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 22px",
        gap: "20px",
      }}
    >
      {/* LEFT - SONG */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "25%",
        }}
      >
        <img
          src={currentSong.coverUrl || "https://placehold.co/50"}
          alt=""
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "12px",
            objectFit: "cover",
            boxShadow: isPlaying ? "0 0 20px rgba(255,255,255,0.25)" : "none",
            transition: "all 0.4s ease",
          }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{currentSong.title}</div>
          <div style={{ fontSize: "12px", color: "#aaa" }}>
            {currentSong.artist}
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div style={{ width: "50%", textAlign: "center" }}>
        {/* CONTROLS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "6px",
          }}
        >
          {[
            { label: "⏮", fn: prevSong },
            {
              label: isShuffle ? "🔀" : "🔀",
              fn: () => setIsShuffle(!isShuffle),
              active: isShuffle,
            },
            { label: isPlaying ? "⏸" : "▶", fn: togglePlay, main: true },
            { label: "⏭", fn: nextSong },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.fn}
              style={{
                padding: btn.main ? "10px 14px" : "6px 10px",
                fontSize: btn.main ? "18px" : "14px",
                borderRadius: btn.main ? "50%" : "10px",
                border: btn.main ? "none" : "1px solid rgba(255,255,255,0.1)",
                background: btn.main
                  ? "linear-gradient(135deg,#1db954,#1ed760)"
                  : btn.active
                    ? "rgba(29,185,84,0.25)"
                    : "rgba(255,255,255,0.05)",
                color: btn.main ? "#000" : "#fff",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: btn.main ? "0 0 20px rgba(29,185,84,0.5)" : "none",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.1)";
                e.target.style.background = btn.main
                  ? "linear-gradient(135deg,#1ed760,#1db954)"
                  : "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.background = btn.main
                  ? "linear-gradient(135deg,#1db954,#1ed760)"
                  : btn.active
                    ? "rgba(29,185,84,0.25)"
                    : "rgba(255,255,255,0.05)";
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* PROGRESS */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: "#aaa" }}>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              accentColor: "#1db954",
              cursor: "pointer",
            }}
          />

          <span style={{ fontSize: "11px", color: "#aaa" }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "25%",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={toggleMute}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "6px 10px",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{
            width: "110px",
            accentColor: "#1db954",
          }}
        />
      </div>

      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={() => {
          setCurrentIndex((prev) => {
            if (isShuffle) {
              let newIndex;
              do {
                newIndex = Math.floor(Math.random() * songs.length);
              } while (newIndex === prev);
              return newIndex;
            } else {
              return (prev + 1) % songs.length;
            }
          });
        }}
      />
    </div>
  );
};

export default Player;
