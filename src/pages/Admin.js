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

      const res = await fetch(
        "https://music-player-backend-m8l8.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        },
      );

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
    fetch("https://music-player-backend-m8l8.onrender.com/songs")
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, []);

  const startEdit = (song) => {
    setEditingId(song._id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
  };

  const handleDelete = async (id) => {
    await fetch(`https://music-player-backend-m8l8.onrender.com/${id}`, {
      method: "DELETE",
    });

    setSongs(songs.filter((song) => song._id !== id));
  };

  const [youtubeLink, setYoutubeLink] = useState("");
  const importFromYoutube = async () => {
    alert("Import started...");

    await fetch(
      "https://music-player-backend-m8l8.onrender.com/youtube-import",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: youtubeLink }),
      },
    );

    alert("Done! Refresh songs 🎵");
  };

  const saveEdit = async (id) => {
    const res = await fetch(
      `https://music-player-backend-m8l8.onrender.com/songs/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          artist: editArtist,
        }),
      },
    );

    const updated = await res.json();

    setSongs(songs.map((song) => (song._id === id ? updated : song)));
    setEditingId(null);
  };
  return (
    <div
      style={{
        height: "100vh",
        background: "#121212",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleUpload}
        style={{
          background: "#181818",
          padding: "30px",
          borderRadius: "10px",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h2>Admin Upload 🎧</h2>

        <input
          type="text"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Artist Name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          style={inputStyle}
        />

        <div>
          <label>Upload Audio</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files[0])}
          />
        </div>

        <div>
          <label>Upload Cover</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#1db954",
            border: "none",
            padding: "10px",
            borderRadius: "5px",
            cursor: "pointer",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          {loading ? "Uploading..." : "Upload Song"}
        </button>

        {message && <p>{message}</p>}
        <button
          onClick={() => {
            localStorage.removeItem("isAdmin");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </form>
      <div style={{ marginTop: "30px" }}>
        <h3>Uploaded Songs 🎵</h3>

        {songs.map((song) => (
          <div
            key={song._id}
            style={{
              marginBottom: "10px",
              background: "#222",
              padding: "10px",
            }}
          >
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

                <button onClick={() => saveEdit(song._id)}>Save</button>
              </>
            ) : (
              <>
                <p>
                  {song.title} - {song.artist}
                </p>

                <button onClick={() => startEdit(song)}>Edit</button>
                <button onClick={() => handleDelete(song._id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Paste YouTube link or playlist"
        value={youtubeLink}
        onChange={(e) => setYoutubeLink(e.target.value)}
      />

      <button onClick={importFromYoutube}>Import from YouTube</button>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  border: "none",
  outline: "none",
};

export default Admin;
