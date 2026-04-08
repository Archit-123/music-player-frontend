import React, { useState, useEffect } from "react";

const Admin = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audio, setAudio] = useState(null);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [songs, setSongs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!audio || !cover) {
      return setMessage("Please select files");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("audio", audio);
    formData.append("cover", cover);

    try {
      setLoading(true);
      setMessage("Uploading...");

      const res = await fetch(`${process.env.REACT_APP_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);

      setMessage("Upload successful 🎉");
      setTitle("");
      setArtist("");
      setAudio(null);
      setCover(null);
    } catch (err) {
      setMessage("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Songs
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/songs`)
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, []);

  const startEdit = (song) => {
    setEditingId(song._id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/songs/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      console.log("DELETE RESPONSE:", data);

      // Only update UI AFTER backend success
      setSongs(songs.filter((song) => song._id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const [youtubeLink, setYoutubeLink] = useState("");
  const importFromYoutube = async () => {
    alert("Import started...");

    await fetch(`${process.env.REACT_APP_API_URL}/youtube-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: youtubeLink }),
    });

    alert("Done! Refresh songs 🎵");
  };

  // song count
  console.log("Song count:", songs.length);

  const saveEdit = async (id) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/songs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        artist: editArtist,
      }),
    });

    const updated = await res.json();

    setSongs(songs.map((song) => (song._id === id ? updated : song)));
    setEditingId(null);
  };
  return (
    <div style={{ display: "flex", height: "100vh", background: "#121212" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#000",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h2>Admin 🎧</h2>
        <p>Total Songs: {songs.length}</p>

        <button
          onClick={() => {
            localStorage.removeItem("isAdmin");
            window.location.href = "/login";
          }}
          style={sidebarBtn}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{ flex: 1, padding: "30px", color: "#fff", overflowY: "auto" }}
      >
        {/* Upload Section */}
        <div style={cardStyle}>
          <h2>Upload Song</h2>

          <form
            onSubmit={handleUpload}
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              style={inputStyle}
            />
            <input type="file" onChange={(e) => setAudio(e.target.files[0])} />
            <input type="file" onChange={(e) => setCover(e.target.files[0])} />

            <button type="submit" style={primaryBtn}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {message && <p>{message}</p>}
        </div>
        {/* YouTube Import Section */}
        <div style={cardStyle}>
          <h2>Import from YouTube 🎥</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Paste YouTube link or playlist"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />

            <button onClick={importFromYoutube} style={primaryBtn}>
              Import
            </button>
          </div>
        </div>
        {/* Song List */}
        <div style={cardStyle}>
          <h2>All Songs</h2>

          {songs.map((song) => (
            <div key={song._id} style={songRow}>
              <div>
                <b>{song.title}</b>
                <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>
                  {song.artist}
                </p>
              </div>

              {editingId === song._id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <input
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                  />
                  <button onClick={() => saveEdit(song._id)}>💾</button>
                </>
              ) : (
                <div>
                  <button onClick={() => startEdit(song)}>✏️</button>
                  <button onClick={() => handleDelete(song._id)}>🗑</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  border: "none",
  outline: "none",
};
const cardStyle = {
  background: "#181818",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
};

const songRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#222",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "10px",
};

const primaryBtn = {
  background: "#1db954",
  border: "none",
  padding: "10px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

const sidebarBtn = {
  marginTop: "20px",
  padding: "10px",
  width: "100%",
  background: "#1db954",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Admin;
