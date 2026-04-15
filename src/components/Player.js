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

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // return (
  //   <>
  //     {/* MINI PLAYER */}
  //     {!isExpanded && (
  //       <div
  //         onClick={() => setIsExpanded(true)}
  //         style={{
  //           position: "fixed",
  //           bottom: 10,
  //           left: "50%",
  //           transform: "translateX(-50%)",
  //           width: "95%",
  //           background: "rgba(20,20,20,0.9)",
  //           borderRadius: "12px",
  //           padding: "10px",
  //           display: "flex",
  //           alignItems: "center",
  //           gap: "10px",
  //           cursor: "pointer",
  //         }}
  //       >
  //         <img
  //           src={currentSong.coverUrl}
  //           style={{ width: "45px", height: "45px", borderRadius: "8px" }}
  //         />

  //         <div style={{ flex: 1 }}>
  //           <div style={{ fontSize: "14px" }}>{currentSong.title}</div>
  //           <div style={{ fontSize: "11px", color: "#aaa" }}>
  //             {currentSong.artist}
  //           </div>
  //         </div>

  //         <button
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             togglePlay();
  //           }}
  //         >
  //           {isPlaying ? "⏸" : "▶"}
  //         </button>
  //       </div>
  //     )}

  //     {/* FULL PLAYER */}
  //     {isExpanded && (
  //       <div
  //         style={{
  //           position: "fixed",
  //           top: 0,
  //           left: 0,
  //           width: "100%",
  //           height: "100%",
  //           background: "linear-gradient(to bottom, #3a1f1f, #000)",
  //           color: "#fff",
  //           display: "flex",
  //           flexDirection: "column",
  //           alignItems: "center",
  //           justifyContent: "center",
  //           padding: "20px",
  //           zIndex: 999,
  //         }}
  //       >
  //         {/* CLOSE BUTTON */}
  //         <div
  //           style={{
  //             position: "absolute",
  //             top: 20,
  //             left: 20,
  //             cursor: "pointer",
  //             fontSize: "20px",
  //           }}
  //           onClick={() => setIsExpanded(false)}
  //         >
  //           ⬇
  //         </div>

  //         {/* ALBUM */}
  //         <img
  //           src={currentSong.coverUrl}
  //           style={{
  //             width: "80%",
  //             maxWidth: "300px",
  //             borderRadius: "12px",
  //             marginBottom: "20px",
  //           }}
  //         />

  //         {/* TITLE */}
  //         <h2>{currentSong.title}</h2>
  //         <p style={{ color: "#aaa" }}>{currentSong.artist}</p>

  //         {/* PROGRESS */}
  //         <input
  //           type="range"
  //           min="0"
  //           max={duration}
  //           value={currentTime}
  //           onChange={handleSeek}
  //           style={{ width: "90%", margin: "20px 0" }}
  //         />

  //         {/* CONTROLS */}
  //         <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
  //           <button onClick={prevSong}>⏮</button>
  //           <button onClick={() => setIsShuffle(!isShuffle)}>🔀</button>

  //           <button
  //             onClick={togglePlay}
  //             style={{
  //               fontSize: "22px",
  //               padding: "12px 18px",
  //               borderRadius: "50%",
  //               background: "#1db954",
  //               border: "none",
  //             }}
  //           >
  //             {isPlaying ? "⏸" : "▶"}
  //           </button>

  //           <button onClick={nextSong}>⏭</button>
  //         </div>
  //       </div>
  //     )}

  //     {/* AUDIO */}
  //     <audio
  //       ref={audioRef}
  //       src={currentSong.audioUrl}
  //       onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
  //       onLoadedMetadata={() => setDuration(audioRef.current.duration)}
  //       onEnded={() => {
  //         setCurrentIndex((prev) => (prev + 1) % songs.length);
  //       }}
  //     />
  //   </>
  // );
  return (
    <>
      {/* MOBILE PLAYER ONLY */}
      {isMobile && (
        <>
          {/* MINI PLAYER */}
          {!isExpanded && (
            <div
              onClick={() => setIsExpanded(true)}
              style={{
                position: "fixed",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: "95%",
                background: "rgba(20,20,20,0.85)",
                backdropFilter: "blur(10px)",
                borderRadius: "14px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={currentSong.coverUrl}
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>
                  {currentSong.title}
                </div>
                <div style={{ fontSize: "11px", color: "#aaa" }}>
                  {currentSong.artist}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                style={{
                  background: "#1db954",
                  border: "none",
                  borderRadius: "50%",
                  width: "38px",
                  height: "38px",
                  color: "#000",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(29,185,84,0.6)",
                }}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
            </div>
          )}

          {/* FULL PLAYER */}
          {isExpanded && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100vh",
                background: "linear-gradient(to bottom, #2c1a1a, #000)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                // padding: "16px",
                zIndex: 999,
                overflow: "hidden", // ✅ prevent weird overflow
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  padding: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ fontSize: "20px", cursor: "pointer" }}
                  onClick={() => setIsExpanded(false)}
                >
                  ⬇
                </span>

                <span style={{ fontSize: "14px", color: "#ccc" }}>
                  Now Playing
                </span>

                <span style={{ fontSize: "18px" }}>⋮</span>
              </div>

              {/* SCROLLABLE CENTER */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflowY: "auto", // ✅ key fix
                  padding: "10px 0",
                }}
              >
                {/* ALBUM */}
                <img
                  src={currentSong.coverUrl}
                  style={{
                    width: "75%",
                    maxWidth: "280px",
                    borderRadius: "14px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                  }}
                />

                {/* TITLE */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <h2 style={{ margin: 0 }}>{currentSong.title}</h2>
                  <p style={{ color: "#aaa", marginTop: "5px" }}>
                    {currentSong.artist}
                  </p>
                </div>
              </div>

              {/* BOTTOM FIXED SECTION */}
              <div
                style={{
                  flexShrink: 0,
                  paddingBottom: "10px",
                }}
              >
                {/* PROGRESS */}
                <div
                  style={{
                    // width: "100%",
                    marginBottom: "15px",
                    padding: "0 15px",
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    style={{
                      width: "100%",
                      accentColor: "#1db954",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "#aaa",
                    }}
                  >
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* CONTROLS */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "30px",
                  }}
                >
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    style={{
                      background: isShuffle
                        ? "rgba(29,185,84,0.3)"
                        : "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "20px",
                    }}
                  >
                    🔀
                  </button>

                  <button
                    onClick={prevSong}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: "24px",
                    }}
                  >
                    ⏮
                  </button>

                  <button
                    onClick={togglePlay}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      background: "#1db954",
                      border: "none",
                      color: "#000",
                      fontSize: "26px",
                      boxShadow: "0 0 25px rgba(29,185,84,0.6)",
                    }}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>

                  <button
                    onClick={nextSong}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: "24px",
                    }}
                  >
                    ⏭
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* DESKTOP PLAYER RESTORED */}
      {!isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "95%",
            background: "rgba(20,20,20,0.65)",
            backdropFilter: "blur(20px)",
            borderRadius: "18px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={currentSong.coverUrl}
              style={{ width: "50px", height: "50px", borderRadius: "10px" }}
            />
            <div>
              <div>{currentSong.title}</div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>
                {currentSong.artist}
              </div>
            </div>
          </div>

          <button
            onClick={togglePlay}
            style={{
              background: "#1db954",
              border: "none",
              borderRadius: "50%",
              width: "45px",
              height: "45px",
              color: "#000",
              fontSize: "18px",
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>
      )}

      {/* AUDIO */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={() => {
          setCurrentIndex((prev) => (prev + 1) % songs.length);
        }}
      />
    </>
  );
};

export default Player;
