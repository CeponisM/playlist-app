import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import Playlist from '../components/Playlist';
import Comments from '../components/Comments';
import { useStore } from '../store';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import { ThemeContext } from '../context/ThemeContext';

const HomePage = () => {
  const { theme } = useContext(ThemeContext);
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

  const getSongUrlWithAutoplay = (song) => {
    if (song.platform === 'local') {
      return song.url;
    }
    const urlObj = new URL(song.url);
    if (song.platform === 'youtube') {
      urlObj.searchParams.set('autoplay', isAutoplay && isPlaying ? '1' : '0');
      urlObj.searchParams.set('enablejsapi', '1');
    } else if (song.platform === 'soundcloud') {
      urlObj.searchParams.set('auto_play', isAutoplay && isPlaying ? 'true' : 'false');
    }
    return urlObj.toString();
  };

  const controlIframePlayback = (play) => {
    if (!playerRef.current || !currentSong || currentSong.platform === 'local') return;
    const message = JSON.stringify({
      event: 'command',
      func: play ? 'playVideo' : 'pauseVideo',
    });
    playerRef.current.contentWindow?.postMessage(message, '*');
  };

  useEffect(() => {
    const loadedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylists(loadedPlaylists);
    if (!currentPlaylistId && loadedPlaylists.length > 0) {
      setCurrentPlaylistId(loadedPlaylists[0].id);
    }
  }, [setPlaylists, currentPlaylistId]);

  useEffect(() => {
    if (songs.length === 0) {
      setCurrentSong(null);
      setCurrentSongIndex(0);
      setShuffledIndices([]);
      setIsPlaying(false);
      return;
    }

    if (isShuffled) {
      const indices = [...Array(songs.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      if (currentSong && songs.findIndex((s) => s.id === currentSong.id) !== -1) {
        const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
        const shuffledIndex = indices.indexOf(currentIndex);
        if (shuffledIndex !== -1) {
          indices.splice(shuffledIndex, 1);
          indices.unshift(currentIndex);
        }
      }
      setShuffledIndices(indices);
    } else {
      setShuffledIndices([...Array(songs.length).keys()]);
    }

    const index = isShuffled ? shuffledIndices[currentSongIndex] || currentSongIndex : currentSongIndex;
    if (index >= 0 && index < songs.length) {
      const song = songs[index];
      const urlWithAutoplay = getSongUrlWithAutoplay(song);
      setCurrentSong({ ...song, url: urlWithAutoplay });
      if (playerRef.current && song.platform === 'local') {
        playerRef.current.src = song.url;
        playerRef.current.autoplay = isAutoplay && isPlaying;
        if (isAutoplay && isPlaying) {
          playerRef.current.play().catch((err) => {
            console.error('Autoplay failed:', err);
            toast.error('Autoplay blocked; please interact with the page');
          });
        }
      }
      if (isPlaying) controlIframePlayback(true);
    }
  }, [songs, currentSongIndex, isShuffled, isPlaying, isAutoplay]);

  const handleSetCurrentSong = (song) => {
    const index = songs.findIndex((s) => s.id === song.id);
    if (index !== -1) {
      setCurrentSongIndex(index);
      const urlWithAutoplay = getSongUrlWithAutoplay(song);
      setCurrentSong({ ...song, url: urlWithAutoplay });
      if (isShuffled) {
        const indices = [...Array(songs.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const shuffledIndex = indices.indexOf(index);
        indices.splice(shuffledIndex, 1);
        indices.unshift(index);
        setShuffledIndices(indices);
        setCurrentSongIndex(0);
      }
      if (song.platform === 'local' && playerRef.current) {
        playerRef.current.src = song.url;
        playerRef.current.autoplay = isAutoplay && isPlaying;
        if (isAutoplay && isPlaying) {
          playerRef.current.play().catch((err) => {
            console.error('Autoplay failed:', err);
            toast.error('Autoplay blocked; please interact with the page');
          });
        }
      }
      setIsPlaying(isAutoplay && isPlaying);
      if (isPlaying) controlIframePlayback(true);
    }
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
    } else {
      nextIndex = currentSongIndex + 1;
      if (nextIndex >= songs.length) {
        nextIndex = isRepeat ? 0 : currentSongIndex;
        if (!isRepeat) {
          setIsPlaying(false);
          return;
        }
      }
    }
    setCurrentSongIndex(nextIndex);
    const index = isShuffled ? shuffledIndices[nextIndex] : nextIndex;
    if (index >= 0 && index < songs.length) {
      const song = songs[index];
      const urlWithAutoplay = getSongUrlWithAutoplay(song);
      setCurrentSong({ ...song, url: urlWithAutoplay });
      if (song.platform === 'local' && playerRef.current) {
        playerRef.current.src = song.url;
        playerRef.current.autoplay = isAutoplay;
        if (isAutoplay) {
          playerRef.current.play().catch((err) => {
            console.error('Autoplay failed:', err);
            toast.error('Autoplay blocked; please interact with the page');
          });
        } else {
          playerRef.current.pause();
        }
      }
      setIsPlaying(isAutoplay);
      if (isAutoplay) controlIframePlayback(true);
    }
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
    } else {
      prevIndex = currentSongIndex - 1;
      if (prevIndex < 0) {
        prevIndex = isRepeat ? songs.length - 1 : 0;
        if (!isRepeat) {
          setIsPlaying(false);
          return;
        }
      }
    }
    setCurrentSongIndex(prevIndex);
    const index = isShuffled ? shuffledIndices[prevIndex] : prevIndex;
    if (index >= 0 && index < songs.length) {
      const song = songs[index];
      const urlWithAutoplay = getSongUrlWithAutoplay(song);
      setCurrentSong({ ...song, url: urlWithAutoplay });
      if (song.platform === 'local' && playerRef.current) {
        playerRef.current.src = song.url;
        playerRef.current.autoplay = isAutoplay;
        if (isAutoplay) {
          playerRef.current.play().catch((err) => {
            console.error('Autoplay failed:', err);
            toast.error('Autoplay blocked; please interact with the page');
          });
        } else {
          playerRef.current.pause();
        }
      }
      setIsPlaying(isAutoplay);
      if (isAutoplay) controlIframePlayback(true);
    }
  };

  const handlePlayPause = (playing) => {
    setIsPlaying(playing);
    if (currentSong?.platform === 'local' && playerRef.current) {
      if (playing) {
        playerRef.current.play().catch((err) => {
          console.error('Play failed:', err);
          toast.error('Playback failed; please try again');
        });
      } else {
        playerRef.current.pause();
      }
    } else {
      controlIframePlayback(playing);
    }
  };

  return (
    <motion.div
      className={`flex flex-col h-screen overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar
          playlists={playlists}
          onRemovePlaylist={removePlaylist}
          onReorderPlaylists={reorderPlaylists}
          onRenamePlaylist={renamePlaylist}
          onSelectPlaylist={(id) => {
            setCurrentPlaylistId(id);
            setCurrentSongIndex(0);
            setIsPlaying(false);
          }}
          onCreatePlaylist={createPlaylist}
          onAddSong={debounce(addSong, 500)}
          currentPlaylistId={currentPlaylistId}
        />
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
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
                  onShuffle={() => {
                    setIsShuffled(!isShuffled);
                    setCurrentSongIndex(0);
                  }}
                  onRepeat={() => setIsRepeat(!isRepeat)}
                  onAutoplay={() => setIsAutoplay(!isAutoplay)}
                  playerRef={playerRef}
                />
                <Playlist
                  songs={songs}
                  onRemoveSong={(songId) => {
                    const songIndex = songs.findIndex((song) => song.id === songId);
                    const isCurrentSong = currentSong && currentSong.id === songId;
                    removeSong(songId);
                    if (isCurrentSong) {
                      if (songs.length > 1) {
                        let nextIndex = songIndex;
                        if (nextIndex >= songs.length - 1) nextIndex = 0;
                        setCurrentSongIndex(nextIndex);
                      } else {
                        setCurrentSong(null);
                        setCurrentSongIndex(0);
                        setIsPlaying(false);
                      }
                    } else if (songIndex < currentSongIndex) {
                      setCurrentSongIndex(currentSongIndex - 1);
                    }
                  }}
                  onReorderSongs={(reorderedSongs, dragResult) => {
                    reorderSongs(reorderedSongs);
                    if (currentSong) {
                      const newIndex = reorderedSongs.findIndex((song) => song.id === currentSong.id);
                      if (newIndex !== -1) setCurrentSongIndex(newIndex);
                    }
                  }}
                  onSongClick={handleSetCurrentSong}
                  currentSong={currentSong}
                />
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="text-center">
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    No playlist selected
                  </h2>
                  <p className={`text-gray-400 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a playlist or create a new one
                  </p>
                </div>
              </div>
            )}
            <audio ref={playerRef} onEnded={handleNextSong} />
          </div>
          {currentSong && <Comments song={currentSong} />}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
