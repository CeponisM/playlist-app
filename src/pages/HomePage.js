import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import Playlist from '../components/Playlist';
import axios from 'axios';

const HomePage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState([]);
  const playerRef = useRef(null);

  useEffect(() => {
    // Load playlists from local storage and update state
    const loadedPlaylists = loadPlaylists();
    setPlaylists(loadedPlaylists);
  }, []);

  useEffect(() => {
    if (currentPlaylistId) {
      // Fetch songs in the current playlist here and update state
      const playlist = playlists.find((p) => p.id === currentPlaylistId);
      if (playlist) {
        setSongs(playlist.songs);
        setCurrentSongIndex(0);
      }
    }
  }, [currentPlaylistId, playlists]);

  useEffect(() => {
    if (songs.length > 0 && currentSongIndex < songs.length) {
      // Fetch song details here and update state
      setCurrentSong(songs[currentSongIndex]);
    }
  }, [songs, currentSongIndex]);

  const handleSelectPlaylist = (playlistId) => {
    setCurrentPlaylistId(playlistId);
  };

  const handlePlayPause = () => {
    if (playerRef.current.paused) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRemoveSong = (id) => {
    const updatedSongs = songs.filter((song) => song.id !== id);
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === currentPlaylistId) {
        return { ...playlist, songs: updatedSongs };
      }
      return playlist;
    });
    setSongs(updatedSongs);
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
  };

  const handleReorderSongs = (newSongs) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === currentPlaylistId) {
        return { ...playlist, songs: newSongs };
      }
      return playlist;
    });
    setSongs(newSongs);
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
  };

  const handleCreatePlaylist = (playlistName) => {
    const newPlaylist = { id: Date.now(), name: playlistName, songs: [] };
    const newPlaylists = [...playlists, newPlaylist];
    setPlaylists(newPlaylists);
    savePlaylists(newPlaylists);
  };

  const handleAddSong = (song) => {
    console.log(song)
    const updatedSongs = [...songs, song];
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === currentPlaylistId) {
        return { ...playlist, songs: updatedSongs };
      }
      return playlist;
    });
    setSongs(updatedSongs);
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
    setCurrentSongIndex(updatedSongs.length - 1); // Set the current song index to the new song
  };

  const handleNextSong = () => {
    setCurrentSongIndex((currentSongIndex + 1) % songs.length);
  };

  const handlePreviousSong = () => {
    setCurrentSongIndex((currentSongIndex - 1 + songs.length) % songs.length);
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    setCurrentSongIndex(randomIndex);
  };

  // Function to set the current song
  const handleSetCurrentSong = (song) => {
    setCurrentSong(song);
    const songIndex = songs.findIndex((s) => s.id === song.id);
    setCurrentSongIndex(songIndex);
    setIsPlaying(true); // Start playing the new song
  };

  const loadPlaylists = () => {
    const playlistsData = localStorage.getItem('playlists');
    return playlistsData ? JSON.parse(playlistsData) : [];
  };

  const savePlaylists = (playlistsData) => {
    localStorage.setItem('playlists', JSON.stringify(playlistsData));
  };

  const handleRemovePlaylist = (playlistId) => {
    // Implement the removal logic here
    // For example, you can filter the playlists array to remove the playlist with the given ID
    const updatedPlaylists = playlists.filter((playlist) => playlist.id !== playlistId);
    setPlaylists(updatedPlaylists);
  };

  const handleReorderPlaylists = (reorderedPlaylists) => {
    // Implement the reordering logic here
    setPlaylists(reorderedPlaylists);
  };

  const handleRenamePlaylist = (playlistId, newName) => {
    // Implement the renaming logic here
    // For example, you can map through the playlists array and update the name of the playlist with the given ID
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        return { ...playlist, name: newName };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
  };

  return (
    <div>
      <Sidebar
        playlists={playlists}
        onRemovePlaylist={handleRemovePlaylist}
        onReorderPlaylists={handleReorderPlaylists}
        onRenamePlaylist={handleRenamePlaylist}
        onSelectPlaylist={handleSelectPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
        onAddSong={handleAddSong}
      />
      {/* Conditionally render Player */}
      {songs.length > 0 && songs[currentSongIndex] && (
        <>
          <Player
            playlists={playlists}
            songs={songs}
            currentSongIndex={currentSongIndex}
            setCurrentSongIndex={setCurrentSongIndex}
            currentSong={currentSong} // Pass the current song
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNextSong={handleNextSong}
            onPreviousSong={handlePreviousSong}
            onShuffle={handleShuffle}
          />
          {/* Render audio element */}
          <audio ref={playerRef} src={songs[currentSongIndex].url} onEnded={handleNextSong} />
        </>
      )}
      <Playlist
        songs={songs}
        onRemoveSong={handleRemoveSong}
        onReorderSongs={handleReorderSongs}
        onSongClick={handleSetCurrentSong} // Pass the click handler to Playlist
      />
    </div>
  );
};

export default HomePage;