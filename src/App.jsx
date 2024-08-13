import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import styles from './App.module.css';

const DB_NAME = 'music-app';
const STORE_NAME = 'songs';

async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

async function addSongToDB(song) {
  const db = await initDB();
  await db.add(STORE_NAME, song);
}

async function getSongsFromDB() {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}

async function deleteSongFromDB(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

function App() {
  const [songs, setSongs] = useState([]);
  const [songName, setSongName] = useState('');
  const [songFile, setSongFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    (async () => {
      const savedSongs = await getSongsFromDB();
      setSongs(savedSongs);
    })();
  }, []);

  const addSong = () => {
    if (songName && songFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const songUrl = e.target.result;

        const newSong = { name: songName, url: songUrl };

        if (coverFile) {
          const coverReader = new FileReader();
          coverReader.onload = async (event) => {
            newSong.cover = event.target.result;
            await addSongToDB(newSong);
            setSongs([...songs, newSong]);
          };
          coverReader.readAsDataURL(coverFile);
        } else {
          await addSongToDB(newSong);
          setSongs([...songs, newSong]);
        }

        setSongName('');
        setSongFile(null);
        setCoverFile(null);
      };
      reader.readAsDataURL(songFile);
    }
  };

  const handleSongFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSongFile(file);
      setSongName(file.name);
    }
  };

  const handleCoverFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
    }
  };

  const handleDelete = async (id) => {
    await deleteSongFromDB(id);
    setSongs(songs.filter(song => song.id !== id));
  };

  return (
    <div className={styles.appContainer}>
      <h1 className={styles.header}>Music App</h1>

      <div className={styles.inputContainer}>
        <label htmlFor="foto">Img</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleSongFileUpload}
          className={styles.inputFile}
        />
        <label htmlFor="music">Music</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverFileUpload}
          className={styles.inputFile}
        />
        <button onClick={addSong} className={styles.addButton}>Add Song</button>
      </div>

      <div className={styles.songList}>
        {songs.length === 0 ? (
          <p>No songs added yet.</p>
        ) : (
          songs.map((song) => (
            <div key={song.id} className={styles.songItem}>
              {song.cover && (
                <img src={song.cover} alt={song.name} className={styles.coverImage} />
              )}
              <div className={styles.songDetails}>
                <strong>{song.name}</strong>
                <audio controls src={song.url} className={styles.audioPlayer}></audio>
              </div>
              <button onClick={() => handleDelete(song.id)} className={styles.deleteButton}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
