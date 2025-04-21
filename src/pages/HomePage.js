import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import Playlist from '../components/Playlist';
import { useStore } from '../store';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

const HomePage = () => {
  const {
    playlists,
    setPlaylists,
    addSong,
    removeSong,
    reorderSongs,
    createPlaylist,
    removePlaylist,
    renamePlaylist,
    reorderPlaylists,
    currentPlaylistId,
    setCurrentPlaylistId,
  } = useStore();
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const playerRef = useRef(null);
  const songs = playlists.find((p) => p.id === currentPlaylistId)?.songs || [];

  useEffect(() => {
    const loadedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylists(loadedPlaylists);
  }, [setPlaylists]);

  useEffect(() => {
    if (songs.length === 0) {
      setCurrentSong(null);
      setCurrentSongIndex(0);
      setShuffledIndices([]);
      return;
    }

    // Update shuffled indices when songs change
    if (isShuffled) {
      const indices = [...Array(songs.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      // Ensure current song index is preserved in shuffle if valid
      if (currentSong && songs.findIndex((s) => s.id === currentSong.id) !== -1) {
        const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
        const shuffledIndex = indices.indexOf(currentIndex);
        if (shuffledIndex !== -1) {
          indices.splice(shuffledIndex, 1);
          indices.unshift(currentIndex); // Place current song at the start of shuffle
        }
      }
      setShuffledIndices(indices);
    } else {
      setShuffledIndices([...Array(songs.length).keys()]);
    }

    // Set current song based on index
    const index = isShuffled ? shuffledIndices[currentSongIndex] || currentSongIndex : currentSongIndex;
    if (index >= 0 && index < songs.length) {
      setCurrentSong(songs[index]);
      if (playerRef.current && songs[index]?.url && songs[index].platform === 'local') {
        playerRef.current.src = songs[index].url;
        if (isPlaying && isAutoplay) {
          playerRef.current.play().catch((err) => {
            console.error('Autoplay failed:', err);
            toast.error('Autoplay blocked; please interact with the page');
          });
        }
      }
    }
  }, [songs, currentSongIndex, isShuffled, isPlaying, isAutoplay]);

  const handleSelectPlaylist = (playlistId) => {
    setCurrentPlaylistId(playlistId);
    setCurrentSongIndex(0);
    setIsPlaying(false);
  };

  const handlePlayPause = (playing) => {
    setIsPlaying(playing);
  };

  const handleNextSong = () => {
    if (songs.length === 0) return;
    let nextIndex;
    if (isShuffled) {
      nextIndex = currentSongIndex + 1;
      if (nextIndex >= shuffledIndices.length) {
        nextIndex = isRepeat ? 0 : currentSongIndex;
        if (!isRepeat) {
          setIsPlaying(false);
          return;
        }
      }
      setCurrentSongIndex(nextIndex);
    } else {
      nextIndex = currentSongIndex + 1;
      if (nextIndex >= songs.length) {
        nextIndex = isRepeat ? 0 : currentSongIndex;
        if (!isRepeat) {
          setIsPlaying(false);
          return;
        }
      }
      setCurrentSongIndex(nextIndex);
    }
    if (isAutoplay) setIsPlaying(true);
  };

  const handlePreviousSong = () => {
    if (songs.length === 0) return;
    let prevIndex;
    if (isShuffled) {
      prevIndex = currentSongIndex - 1;
      if (prevIndex < 0) {
        prevIndex = isRepeat ? shuffledIndices.length - 1 : 0;
        if (!isRepeat) {
          setIsPlaying(false);
          return;
        }
      }
      setCurrentSongIndex(prevIndex);
    } else {
      prevIndex = currentSongIndex - 1;
      if (prevIndex < 0) {
        prevIndex = isRepeat ? songs.length - 1 : 0;
        if (!isRepeat) {
          setIsPlaying(false);
          return;
        }
      }
      setCurrentSongIndex(prevIndex);
    }
    if (isAutoplay) setIsPlaying(true);
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    if (!isShuffled && songs.length > 0) {
      // Generate new shuffled indices, preserving current song
      const indices = [...Array(songs.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      if (currentSong) {
        const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
        if (currentIndex !== -1) {
          const shuffledIndex = indices.indexOf(currentIndex);
          indices.splice(shuffledIndex, 1);
          indices.unshift(currentIndex); // Keep current song at start
        }
      }
      setShuffledIndices(indices);
      setCurrentSongIndex(0); // Reset to start of shuffled order
    } else {
      setShuffledIndices([...Array(songs.length).keys()]);
      setCurrentSongIndex(songs.findIndex((s) => s.id === currentSong?.id) || 0);
    }
    if (isAutoplay && currentSong) setIsPlaying(true);
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const handleAutoplay = () => {
    setIsAutoplay(!isAutoplay);
    if (!isAutoplay && !isPlaying && currentSong?.platform === 'local' && playerRef.current) {
      playerRef.current.play().catch((err) => {
        console.error('Autoplay failed:', err);
        toast.error('Autoplay blocked; please interact with the page');
      });
      setIsPlaying(true);
    }
  };

  const handleSetCurrentSong = (song) => {
    const index = songs.findIndex((s) => s.id === song.id);
    if (index !== -1) {
      setCurrentSongIndex(index);
      setCurrentSong(song);
      if (isShuffled) {
        // Update shuffled indices to start from the selected song
        const indices = [...Array(songs.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const shuffledIndex = indices.indexOf(index);
        indices.splice(shuffledIndex, 1);
        indices.unshift(index); // Place selected song at start
        setShuffledIndices(indices);
        setCurrentSongIndex(0); // Start at the beginning of new shuffled order
      }
      if (isAutoplay) setIsPlaying(true);
    }
  };

  const handleReorderSongs = (reorderedSongs, dragResult) => {
    reorderSongs(reorderedSongs);
    if (currentSong) {
      const newIndex = reorderedSongs.findIndex((song) => song.id === currentSong.id);
      if (newIndex !== -1) {
        setCurrentSongIndex(newIndex);
      }
    }
    if (isShuffled) {
      const indices = [...Array(reorderedSongs.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
    }
  };

  const handleRemoveSong = (songId) => {
    const songIndex = songs.findIndex((song) => song.id === songId);
    const isCurrentSong = currentSong && currentSong.id === songId;

    removeSong(songId);

    if (isCurrentSong) {
      if (songs.length > 1) {
        let nextIndex = songIndex;
        if (nextIndex >= songs.length - 1) {
          nextIndex = 0;
        }
        setCurrentSongIndex(nextIndex);
      } else {
        setCurrentSong(null);
        setCurrentSongIndex(0);
        setIsPlaying(false);
      }
    } else if (songIndex < currentSongIndex) {
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar
        playlists={playlists}
        onRemovePlaylist={removePlaylist}
        onReorderPlaylists={reorderPlaylists}
        onRenamePlaylist={renamePlaylist}
        onSelectPlaylist={handleSelectPlaylist}
        onCreatePlaylist={createPlaylist}
        onAddSong={debounce(addSong, 500)}
        currentPlaylistId={currentPlaylistId}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {songs.length > 0 && currentSong ? (
          <>
            <Player
              currentSong={currentSong}
              isPlaying={isPlaying}
              isRepeat={isRepeat}
              isShuffled={isShuffled}
              isAutoplay={isAutoplay}
              onPlayPause={handlePlayPause}
              onNextSong={handleNextSong}
              onPreviousSong={handlePreviousSong}
              onShuffle={handleShuffle}
              onRepeat={handleRepeat}
              onAutoplay={handleAutoplay}
              playerRef={playerRef}
            />
            <Playlist
              songs={songs}
              onRemoveSong={handleRemoveSong}
              onReorderSongs={handleReorderSongs}
              onSongClick={handleSetCurrentSong}
              currentSong={currentSong}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No playlist selected</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select a playlist from the sidebar or create a new one to get started
              </p>
            </div>
          </div>
        )}
        <audio ref={playerRef} onEnded={handleNextSong} />
      </div>
    </motion.div>
  );
};

export default HomePage;