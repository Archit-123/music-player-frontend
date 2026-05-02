import { useState, useEffect, useRef, useCallback } from "react";
import Player from "../components/Player";

const Home = () => {
  const [viewMode, setViewMode] = useState("featured");
  // Ham menu
  const [showMenu, setShowMenu] = useState(false);

  // for PlayList
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [playLists, setPlayLists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const filteredSongs = selectedPlaylist?.songs || [];
  const [activeQueue, setActiveQueue] = useState([]);
  // PLaylist Modal
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [showRemoveSongModal, setShowRemoveSongModal] = useState(false);
  const [songToRemove, setSongToRemove] = useState(null);

  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const fetchingRef = useRef(false);
  // Fetch Songs
  const fetchSongs = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
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
  }, [page, hasMore]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Create PLaylist button handler
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !createdBy.trim()) {
      alert("Both fields are required");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlaylistName,
          createdBy,
        }),
      });

      const data = await res.json();

      setPlayLists((prev) => [data, ...prev]);
      setSelectedPlaylist(data);
      setViewMode("playlist");

      setShowModal(false);
      setNewPlaylistName("");
      setCreatedBy("");
    } catch (err) {
      console.error(err);
    }
  };
  // Update/rename PLaylist
  const handleRenamePlaylist = async () => {
    if (!renameValue.trim() || !selectedPlaylist) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/playlists/${selectedPlaylist._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: renameValue }),
        },
      );

      const updated = await res.json();

      setPlayLists((prev) =>
        prev.map((pl) => (pl._id === updated._id ? updated : pl)),
      );

      setSelectedPlaylist(updated);
      setShowRenameModal(false);
      setRenameValue("");
    } catch (err) {
      console.error(err);
    }
  };
  // Delete PLaylist
  const handleDeletePlaylist = async () => {
    if (!selectedPlaylist) return;

    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/playlists/${selectedPlaylist._id}`,
        {
          method: "DELETE",
        },
      );

      setPlayLists((prev) =>
        prev.filter((pl) => pl._id !== selectedPlaylist._id),
      );

      setSelectedPlaylist(null);
      setViewMode("featured");
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
    }
  };
  // remove song from playlist
  const handleRemoveFromPlaylist = async (songId, playlistId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/playlists/${playlistId}/remove-song`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ songId }),
        },
      );

      const updated = await res.json();

      setPlayLists((prev) =>
        prev.map((pl) => (pl._id === updated._id ? updated : pl)),
      );

      if (selectedPlaylist?._id === updated._id) {
        setSelectedPlaylist(updated);
      }

      setSongDropdownId(null);
    } catch (err) {
      console.error(err);
    }
  };
  //Modal to confirm dwelete
  const confirmRemoveSong = async () => {
    if (!songToRemove || !selectedPlaylist) return;

    await handleRemoveFromPlaylist(songToRemove._id, selectedPlaylist._id);

    setShowRemoveSongModal(false);
    setSongToRemove(null);
  };
  // Fetch PLaylist from backend
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/playlists`);
        const data = await res.json();

        setPlayLists(data);

        // set first playlist as selected (optional)
        if (data.length > 0) {
          setSelectedPlaylist(data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaylists();
  }, []);

  //Song dropdown
  const [songDropdownId, setSongDropdownId] = useState(null);
  // Dropdown playlist
  const handleAddToPlaylist = async (songId, playlistId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/playlists/${playlistId}/add-song`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ songId }),
        },
      );

      const updated = await res.json();
      setPlayLists((prev) =>
        prev.map((pl) => (pl._id === updated._id ? updated : pl)),
      );
      if (selectedPlaylist?._id === updated._id) {
        setSelectedPlaylist(updated);
      }

      setSongDropdownId(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const close = () => setSongDropdownId(null);

    if (songDropdownId) {
      window.addEventListener("click", close);
    }

    return () => window.removeEventListener("click", close);
  }, [songDropdownId]);

  // close dropdown in playlist rename and remove

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);

    if (showDropdown) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => window.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && hasMore && !fetchingRef.current) {
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px",
            fontSize: "20px",
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={() => setShowMenu(true)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "22px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
          <div>🎵 My Music</div>
          <div style={{ width: "22px" }} /> {/* spacer */}
        </div>
      )}
      {isMobile && (
        <>
          {/* OVERLAY */}
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.6)",
              zIndex: 999,
              opacity: showMenu ? 1 : 0,
              pointerEvents: showMenu ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          />

          {/* DRAWER */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "260px",
              height: "100%",
              background: "#111",
              padding: "15px",
              zIndex: 1000,
              overflowY: "auto",
              transform: showMenu ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s ease",
              // boxShadow: "5px 0 20px rgba(0,0,0,0.5)",
            }}
          >
            <h2 style={{ marginBottom: "15px", color: "#1db954" }}>Library</h2>

            {/* CREATE PLAYLIST */}
            <div
              onClick={() => {
                setShowModal(true);
                setShowMenu(false);
              }}
              style={{
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              ➕ Create Playlist
            </div>

            {/* FEATURED */}
            <div
              onClick={() => {
                setViewMode("featured");
                setShowMenu(false);
              }}
              style={{
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "10px",
                background:
                  viewMode === "featured"
                    ? "rgba(29,185,84,0.25)"
                    : "rgba(255,255,255,0.05)",
              }}
            >
              Featured Songs
            </div>

            {/* PLAYLISTS */}
            {playLists.map((pl) => (
              <div
                key={pl._id}
                onClick={() => {
                  setSelectedPlaylist(pl);
                  setViewMode("playlist");
                  setShowMenu(false);
                }}
                style={{
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "10px",
                  background:
                    viewMode === "playlist" && selectedPlaylist?._id === pl._id
                      ? "rgba(29,185,84,0.25)"
                      : "rgba(255,255,255,0.05)",
                }}
              >
                <div>{pl.name}</div>
                <div style={{ fontSize: "12px", color: "#aaa" }}>
                  {pl.songs?.length || 0} songs
                </div>
              </div>
            ))}
          </div>
        </>
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
          <h2 style={{ marginBottom: "15px", color: "#1db954" }}>Library</h2>
          {/* Create PLaylist button  */}
          <div
            onClick={() => setShowModal(true)}
            style={{
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "10px",
              cursor: "pointer",
              background: "rgba(255,255,255,0.08)",
              border: "1px dashed rgba(255,255,255,0.2)",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ➕ Create Playlist
          </div>
          {/* Featured songs  */}
          <div
            onClick={() => {
              setViewMode("featured");
              setCurrentIndex(0); // reset player index
            }}
            style={{
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
              cursor: "pointer",
              background:
                viewMode === "featured"
                  ? "rgba(29,185,84,0.25)"
                  : "rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ fontWeight: 500 }}>Featured Songs</div>
            <div style={{ fontSize: "12px", color: "#aaa" }}>Admin</div>
          </div>
          {/* Playlist Songs  */}
          {playLists.map((pl) => (
            <div
              key={pl._id}
              onClick={() => {
                setSelectedPlaylist(pl);
                setViewMode("playlist");
              }}
              style={{
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "10px",
                cursor: "pointer",
                background:
                  viewMode === "playlist" && selectedPlaylist?._id === pl._id
                    ? "rgba(29,185,84,0.25)"
                    : "rgba(255,255,255,0.05)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontWeight: 500 }}>{pl.name}</div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>
                {pl.songs?.length || 0} songs
              </div>
            </div>
          ))}
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
        {/* Playlist details header  */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h2>
            {viewMode === "featured"
              ? "Featured Songs"
              : selectedPlaylist?.name || "Playlist"}
          </h2>

          {/* Show only in playlist mode */}
          {viewMode === "playlist" && selectedPlaylist && (
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown((prev) => !prev);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ...
              </button>

              {showDropdown && (
                <div
                  style={{
                    width: "130px",
                    position: "absolute",
                    right: 0,
                    top: "30px",
                    background: "#222",
                    borderRadius: "8px",
                    overflow: "hidden",
                    zIndex: 10,
                  }}
                >
                  <div
                    onClick={() => {
                      setRenameValue(selectedPlaylist?.name || "");
                      setShowRenameModal(true);
                      setShowDropdown(false);
                    }}
                    style={{ padding: "10px", cursor: "pointer" }}
                  >
                    ✏️ Rename
                  </div>

                  <div
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowDropdown(false);
                    }}
                    style={{ padding: "10px", cursor: "pointer", color: "red" }}
                  >
                    🗑 Delete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <p style={{ color: "#aaa", marginBottom: "20px" }}>
          {viewMode === "featured"
            ? `${songs.length} songs`
            : selectedPlaylist
              ? `Created • ${selectedPlaylist.songs?.length || 0} songs`
              : ""}
        </p>
        {/* MOBILE LIST VIEW */}
        {isMobile ? (
          (viewMode === "featured" ? songs : filteredSongs).map(
            (song, index) => {
              const isPlaylist = viewMode === "playlist";
              const isActive = activeQueue[currentIndex]?._id === song._id;

              return (
                <div
                  key={song._id || song.id}
                  onClick={() => {
                    if (isPlaylist) {
                      setActiveQueue(filteredSongs);
                    } else {
                      setActiveQueue(songs);
                    }
                    setCurrentIndex(index);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    background: isActive
                      ? "rgba(29,185,84,0.25)"
                      : "rgba(255,255,255,0.05)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* LEFT SIDE */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={song.coverUrl || "https://placehold.co/50"}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                      alt=""
                    />

                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {song.title || song.song}
                      </div>
                      <div style={{ fontSize: "12px", color: "#aaa" }}>
                        {song.artist}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {/* PLAYLIST DELETE */}
                    {isPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToRemove(song);
                          setShowRemoveSongModal(true);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ff4d4d",
                          fontSize: "16px",
                        }}
                      >
                        🗑
                      </button>
                    )}

                    {/* ADD TO PLAYLIST */}
                    {!isPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongDropdownId(
                            song._id === songDropdownId ? null : song._id,
                          );
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          fontSize: "18px",
                        }}
                      >
                        ⋮
                      </button>
                    )}
                  </div>

                  {/* DROPDOWN (ADD TO PLAYLIST) */}
                  {songDropdownId === song._id && (
                    <div
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "60px",
                        background: "#222",
                        borderRadius: "8px",
                        padding: "5px",
                        zIndex: 20,
                        width: "160px",
                      }}
                    >
                      {playLists.map((pl) => {
                        const alreadyAdded = pl.songs?.some(
                          (s) => s._id === song._id,
                        );

                        return (
                          <div
                            key={pl._id}
                            onClick={(e) => {
                              e.stopPropagation();

                              if (alreadyAdded) {
                                handleRemoveFromPlaylist(song._id, pl._id);
                              } else {
                                handleAddToPlaylist(song._id, pl._id);
                              }
                            }}
                            style={{
                              padding: "8px",
                              fontSize: "14px",
                              opacity: alreadyAdded ? 0.6 : 1,
                            }}
                          >
                            {alreadyAdded ? "✔ Added" : "➕ Add to"} {pl.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            },
          )
        ) : (
          /* DESKTOP GRID */

          <div
            style={{
              display: viewMode === "featured" ? "grid" : "flex",
              flexDirection: viewMode === "featured" ? undefined : "column",
              gridTemplateColumns:
                viewMode === "featured"
                  ? "repeat(auto-fill, minmax(180px, 1fr))"
                  : undefined,
              gap: "20px",
            }}
          >
            {viewMode === "featured"
              ? songs.map((song, index) => (
                  <div
                    key={song._id}
                    onClick={() => {
                      setActiveQueue(songs);
                      setCurrentIndex(index);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "12px",
                      padding: "12px",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      position: "relative",
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSongDropdownId(
                          song._id === songDropdownId ? null : song._id,
                        );
                      }}
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      ⋮
                    </button>
                    {songDropdownId === song._id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "35px",
                          right: "10px",
                          background: "#222",
                          borderRadius: "8px",
                          zIndex: 20,
                          padding: "5px",
                          width: "150px",
                        }}
                      >
                        {playLists.map((pl) => {
                          const alreadyAdded = pl.songs?.some(
                            (s) => s._id === song._id,
                          );
                          return (
                            <div
                              key={pl._id}
                              onClick={(e) => {
                                e.stopPropagation();

                                if (alreadyAdded) {
                                  handleRemoveFromPlaylist(song._id, pl._id);
                                } else {
                                  handleAddToPlaylist(song._id, pl._id);
                                }
                              }}
                              style={{
                                padding: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                opacity: alreadyAdded ? 0.6 : 1,
                              }}
                            >
                              {alreadyAdded ? "✔ Added" : "➕ Add to"} {pl.name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              : filteredSongs.map((song, index) => (
                  <div
                    onClick={() => {
                      setActiveQueue(filteredSongs);
                      setCurrentIndex(index);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)")
                    }
                    key={song._id || song.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 15px",
                      borderRadius: "10px",
                      background:
                        index === currentIndex
                          ? "rgba(29,185,84,0.25)"
                          : "rgba(255,255,255,0.05)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                  >
                    {/* LEFT SIDE (cover + info) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        overflow: "hidden",
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

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "200px",
                          }}
                        >
                          {song.title || song.song}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#aaa",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "200px",
                          }}
                        >
                          {song.artist}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE (delete button) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSongToRemove(song);
                        setShowRemoveSongModal(true);
                      }}
                      style={{
                        background: "rgba(255,0,0,0.1)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        color: "#ff4d4d",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255,0,0,0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "rgba(255,0,0,0.1)")
                      }
                    >
                      🗑
                    </button>
                  </div>
                ))}
          </div>
        )}
        <div ref={loaderRef} style={{ height: "20px" }} />
      </div>

      {/* PLAYER */}
      {activeQueue.length > 0 && (
        <Player
          songs={activeQueue}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      )}
      {/* Modal for playlist  */}
      {showModal && (
        <div
          style={overlayStyle}
          onClick={() => setShowModal(false)} // click outside closes
        >
          <div
            style={modalStyle}
            onClick={(e) => e.stopPropagation()} // prevent close inside
          >
            <form
              style={{ margin: "0 20px" }}
              onSubmit={(e) => {
                e.preventDefault();
                handleCreatePlaylist();
              }}
            >
              <h3 style={{ marginBottom: "20px", fontWeight: "600" }}>
                Create Playlist
              </h3>
              <input
                id="playlistName"
                name="playlistName"
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                style={inputStyle}
                required
              />

              <input
                id="createdBy"
                name="createdBy"
                type="text"
                placeholder="Created by"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                style={inputStyle}
                required
              />

              <div style={buttonRow}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={cancelBtn}
                >
                  Cancel
                </button>

                <button type="submit" style={createBtn}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Rename Playlist  */}
      {showRenameModal && (
        <div style={overlayStyle} onClick={() => setShowRenameModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <h3>Rename Playlist</h3>

            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              style={inputStyle}
            />

            <div style={btnRow}>
              <button onClick={() => setShowRenameModal(false)}>Cancel</button>
              <button onClick={handleRenamePlaylist} style={greenBtn}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Delete Playlist  */}
      {showDeleteModal && (
        <div style={overlayStyle} onClick={() => setShowDeleteModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <h3>Delete Playlist</h3>

            <p style={{ marginBottom: "20px", color: "#aaa" }}>
              Are you sure you want to delete this playlist?
            </p>

            <div style={btnRow}>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={handleDeletePlaylist}
                style={{ ...greenBtn, background: "red" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for confirm delete from playlist  */}
      {showRemoveSongModal && (
        <div style={overlayStyle} onClick={() => setShowRemoveSongModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "10px" }}>Remove Song</h3>

            <p style={{ marginBottom: "20px", color: "#aaa" }}>
              Are you sure you want to remove{" "}
              <strong>{songToRemove?.song || songToRemove?.title}</strong> from
              this playlist?
            </p>

            <div style={btnRow}>
              <button onClick={() => setShowRemoveSongModal(false)}>
                Cancel
              </button>

              <button
                onClick={confirmRemoveSong}
                style={{ ...greenBtn, background: "red" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)",
};

const modalStyle = {
  background: "#181818",
  padding: "25px",
  borderRadius: "14px",
  width: "320px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
};

const inputStyle = {
  width: "100%",
  padding: "12px 0px 12px 11px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#121212",
  color: "#fff",
  marginBottom: "12px",
  outline: "none",
};

const buttonRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
};

const cancelBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#2a2a2a",
  color: "#fff",
  cursor: "pointer",
};

const createBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#1db954",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
};

const btnRow = {
  display: "flex",
  justifyContent: "space-between",
};

const greenBtn = {
  padding: "8px 15px",
  borderRadius: "8px",
  border: "none",
  background: "#1db954",
  cursor: "pointer",
};

export default Home;
