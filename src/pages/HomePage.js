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
    if (songs.length === 0) return;
    const index = isShuffled ? shuffledIndices[currentSongIndex] : currentSongIndex;
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
  }, [songs, currentSongIndex, isPlaying, isShuffled, shuffledIndices, isAutoplay]);

  useEffect(() => {
    if (isShuffled) {
      const indices = [...Array(songs.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
    } else {
      setShuffledIndices([...Array(songs.length).keys()]);
    }
  }, [isShuffled, songs.length]);

  const handleSelectPlaylist = (playlistId) => {
    setCurrentPlaylistId(playlistId);
    setCurrentSongIndex(0);
    setIsPlaying(isAutoplay);
  };

  const handlePlayPause = () => {
    if (playerRef.current && currentSong.platform === 'local') {
      if (playerRef.current.paused) {
        playerRef.current.play().catch((err) => {
          console.error('Play failed:', err);
          toast.error('Playback failed; please try again');
        });
        setIsPlaying(true);
      } else {
        playerRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying); // Toggle for embeds
    }
  };

  const handleNextSong = () => {
    if (songs.length === 0) return;
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = currentSongIndex + 1;
      if (nextIndex >= songs.length) {
        nextIndex = isRepeat ? 0 : currentSongIndex;
        if (!isRepeat) setIsPlaying(false);
      }
    }
    setCurrentSongIndex(nextIndex);
    if (isAutoplay) setIsPlaying(true);
  };

  const handlePreviousSong = () => {
    if (songs.length === 0) return;
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) {
      prevIndex = isRepeat ? songs.length - 1 : 0;
      if (!isRepeat) setIsPlaying(false);
    }
    setCurrentSongIndex(prevIndex);
    if (isAutoplay) setIsPlaying(true);
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentSongIndex(0);
    if (isAutoplay) setIsPlaying(true);
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
    const adjustedIndex = isShuffled ? shuffledIndices.indexOf(index) : index;
    setCurrentSongIndex(adjustedIndex);
    if (isAutoplay) setIsPlaying(true);
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
              onRemoveSong={removeSong}
              onReorderSongs={reorderSongs}
              onSongClick={handleSetCurrentSong}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            Select a playlist or add songs
          </div>
        )}
        <audio ref={playerRef} onEnded={handleNextSong} />
      </div>
    </motion.div>
  );
};

export default HomePage;