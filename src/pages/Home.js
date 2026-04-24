import { useState, useEffect, useRef, useCallback } from "react";
import Player from "../components/Player";

const Home = () => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const fetchingRef = useRef(false);

  const fetchSongs = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/songs?page=${page}&limit=50`,
      );

      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setSongs((prev) => {
          const map = new Map();
          [...prev, ...data].forEach((song) => map.set(song._id, song));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, loading, hasMore]);
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Scroll Effect
  // useEffect(() => {
  //   const container = scrollRef.current;

  //   if (!container) return;

  //   const handleScroll = () => {
  //     const scrollTop = container.scrollTop;
  //     const scrollHeight = container.scrollHeight;
  //     const clientHeight = container.clientHeight;

  //     if (
  //       scrollTop + clientHeight >= scrollHeight - 100 &&
  //       !loading &&
  //       hasMore &&
  //       !fetchingRef.current
  //     ) {
  //       // setHasMore(false);
  //       fetchingRef.current = true;
  //       setPage((prev) => prev + 1);
  //     }
  //   };

  //   container.addEventListener("scroll", handleScroll);

  //   return () => container.removeEventListener("scroll", handleScroll);
  // }, [loading, hasMore]);
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (
          first.isIntersecting &&
          hasMore &&
          !loading &&
          !fetchingRef.current
        ) {
          fetchingRef.current = true;
          setPage((prev) => prev + 1);
        }
      },
      {
        root: scrollRef.current || null,
        rootMargin: "400px",
        threshold: 0,
      },
    );

    observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading]);

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100vh",
        background: "linear-gradient(to bottom, #121212, #000)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* MOBILE HEADER */}
      {isMobile && (
        <div
          style={{
            padding: "15px",
            fontSize: "20px",
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          🎵 My Music
        </div>
      )}

      {/* SIDEBAR (DESKTOP ONLY) */}
      {!isMobile && (
        <div
          style={{
            width: "260px",
            padding: "15px",
            background: "rgba(20,20,20,0.9)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginBottom: "15px", color: "#1db954" }}>🎵 Library</h2>

          {songs.map((song, index) => (
            <div
              key={song._id}
              onClick={() => setCurrentIndex(index)}
              style={{
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "10px",
                cursor: "pointer",
                background:
                  index === currentIndex
                    ? "rgba(29,185,84,0.25)"
                    : "rgba(255,255,255,0.05)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontWeight: 500 }}>{song.title}</div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>
                {song.artist}
              </div>
            </div>
          ))}
          {/* <div ref={loaderRef} style={{ height: "40px" }} /> */}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: isMobile ? "15px" : "25px",
          overflowY: "auto",
          paddingBottom: "120px", // space for player
        }}
      >
        {!isMobile && <h1 style={{ marginBottom: "20px" }}>My Music</h1>}

        {/* MOBILE LIST VIEW */}
        {isMobile ? (
          <div>
            {songs.map((song, index) => (
              <div
                key={song._id}
                onClick={() => setCurrentIndex(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  background:
                    index === currentIndex
                      ? "rgba(29,185,84,0.25)"
                      : "rgba(255,255,255,0.05)",
                }}
              >
                <img
                  src={song.coverUrl || "https://placehold.co/50"}
                  alt=""
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />

                <div>
                  <div style={{ fontWeight: 500 }}>{song.title}</div>
                  <div style={{ fontSize: "12px", color: "#aaa" }}>
                    {song.artist}
                  </div>
                </div>
              </div>
            ))}
            {/* <div ref={loaderRef} style={{ height: "40px" }} /> */}
          </div>
        ) : (
          /* DESKTOP GRID */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {songs.map((song, index) => (
              <div
                key={song._id}
                onClick={() => setCurrentIndex(index)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              >
                <img
                  src={song.coverUrl || "https://placehold.co/150"}
                  alt=""
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginBottom: "10px",
                  }}
                />

                <div style={{ fontWeight: 500 }}>{song.title}</div>
                <div style={{ fontSize: "12px", color: "#aaa" }}>
                  {song.artist}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={loaderRef} style={{ height: "20px" }} />
      </div>

      {/* PLAYER */}
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
