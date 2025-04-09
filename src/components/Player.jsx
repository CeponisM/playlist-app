import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Player = ({
  currentSong,
  isPlaying,
  isRepeat,
  isShuffled,
  isAutoplay,
  onPlayPause,
  onNextSong,
  onPreviousSong,
  onShuffle,
  onRepeat,
  onAutoplay,
  playerRef,
}) => {
  const { theme } = useContext(ThemeContext);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progressRef = useRef(null);
  const iframeRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const progressUpdateInterval = useRef(null);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (currentSong?.platform === 'youtube') {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (youtubePlayerRef.current) {
          youtubePlayerRef.current.destroy();
        }

        youtubePlayerRef.current = new window.YT.Player(iframeRef.current, {
          videoId: currentSong.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1],
          playerVars: {
            autoplay: isAutoplay ? 1 : 0,
            controls: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              setDuration(event.target.getDuration());
              if (isPlaying && isAutoplay) {
                event.target.playVideo();
              }
              progressUpdateInterval.current = setInterval(() => {
                if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
                  const current = youtubePlayerRef.current.getCurrentTime();
                  const total = youtubePlayerRef.current.getDuration();
                  setCurrentTime(current);
                  setProgress((current / total) * 100 || 0);
                }
              }, 1000);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                if (isAutoplay && isRepeat) {
                  youtubePlayerRef.current.seekTo(0);
                  youtubePlayerRef.current.playVideo();
                } else if (isAutoplay) {
                  onNextSong();
                }
              }
              if (event.data === window.YT.PlayerState.PLAYING) {
                onPlayPause(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                onPlayPause(false);
              }
            },
          },
        });
      };

      return () => {
        if (progressUpdateInterval.current) {
          clearInterval(progressUpdateInterval.current);
        }
        delete window.onYouTubeIframeAPIReady;
      };
    }
  }, [currentSong, isAutoplay, isRepeat, onNextSong, onPlayPause]);

  // Local audio progress and event handling
  useEffect(() => {
    const audio = playerRef.current;
    if (audio && currentSong?.platform === 'local') {
      audio.volume = volume;

      const updateProgress = () => {
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      const handlePlay = () => {
        onPlayPause(true);
      };

      const handlePause = () => {
        onPlayPause(false);
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [playerRef, volume, currentSong, onPlayPause]);

  // Spotify/SoundCloud iframe control
  useEffect(() => {
    if (currentSong?.platform !== 'local' && currentSong?.platform !== 'youtube' && iframeRef.current) {
      try {
        if (isPlaying && isAutoplay) {
          iframeRef.current.contentWindow.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            '*'
          );
        } else {
          iframeRef.current.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          );
        }
      } catch (err) {
        console.error('Iframe control failed:', err);
        toast.error('Embed control limited; interact with the player');
      }
    }
  }, [isPlaying, isAutoplay, currentSong]);

  // Sync playing state with audio elements
  useEffect(() => {
    const audio = playerRef.current;
    if (audio && currentSong?.platform === 'local') {
      if (isPlaying) {
        audio.play().catch((err) => {
          console.error('Play failed:', err);
          toast.error('Playback failed; try interacting with the page');
        });
      } else {
        audio.pause();
      }
    } else if (currentSong?.platform === 'youtube' && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.playVideo();
      } else {
        youtubePlayerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, currentSong, playerRef]);

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    const audio = playerRef.current;

    if (audio && currentSong?.platform === 'local') {
      const newTime = (newProgress / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress(newProgress);
      setCurrentTime(newTime);
    } else if (currentSong?.platform === 'youtube' && youtubePlayerRef.current) {
      const newTime = (newProgress / 100) * youtubePlayerRef.current.getDuration();
      youtubePlayerRef.current.seekTo(newTime);
      setProgress(newProgress);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (playerRef.current && currentSong?.platform === 'local') {
      playerRef.current.volume = newVolume;
    } else if (currentSong?.platform === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume * 100);
    }
  };

  const handlePlayPause = () => {
    if (currentSong?.platform === 'local' && playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play().catch((err) => {
          console.error('Play failed:', err);
          toast.error('Playback failed; try interacting with the page');
        });
      } else {
        playerRef.current.pause();
      }
    } else if (currentSong?.platform === 'youtube' && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    } else {
      onPlayPause(!isPlaying); // Toggle for Spotify/SoundCloud
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Player Content */}
      <motion.div
        className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-between shadow-lg z-10`}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <motion.img
            src={currentSong?.thumbnail}
            alt={currentSong?.title}
            className="w-16 h-16 rounded"
            whileHover={{ scale: 1.1 }}
          />
          <div>
            <h3 className="font-semibold text-lg">{currentSong?.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{currentSong?.artist}</p>
          </div>
        </div>
        <div className="flex-1 mx-4">
          {currentSong.platform === 'yandex' ? (
            <div className="w-full h-64 flex items-center justify-center">
              <a
                href={currentSong.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open Yandex Track
              </a>
            </div>
          ) : (
            <>
              {currentSong.platform === 'local' ? (
                <input
                  type="range"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full accent-blue-500"
                  ref={progressRef}
                  aria-label="Seek song"
                />
              ) : (
                <div className="w-full h-64">
                  <iframe
                    ref={iframeRef}
                    src={currentSong.url}
                    title={currentSong.title}
                    className="w-full h-full rounded"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}
            </>
          )}
        </div>
        {(currentSong.platform === 'local' || currentSong.platform === 'youtube') && (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-blue-500"
              aria-label="Adjust volume"
            />
            <span className="text-sm">{Math.round(volume * 100)}%</span>
          </div>
        )}
      </motion.div>
      {/* Control Menu */}
      <motion.div
        className={`fixed bottom-0 left-0 right-0 p-3 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-300'} shadow-lg z-50 flex justify-center items-center`}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-3 bg-gray-700 dark:bg-gray-800 rounded-full p-2 shadow-md">
          <motion.button
            onClick={onShuffle}
            className={`p-2 rounded-full ${isShuffled ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-blue-500'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle shuffle"
          >
            🔀
          </motion.button>
          <motion.button
            onClick={onPreviousSong}
            className="p-2 rounded-full text-gray-300 hover:text-blue-500"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous song"
          >
            ⏮
          </motion.button>
          <motion.button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-blue-500 text-white text-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶️'}
          </motion.button>
          <motion.button
            onClick={onNextSong}
            className="p-2 rounded-full text-gray-300 hover:text-blue-500"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next song"
          >
            ⏭
          </motion.button>
          <motion.button
            onClick={onRepeat}
            className={`p-2 rounded-full ${isRepeat ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-blue-500'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle repeat"
          >
            🔁
          </motion.button>
          <motion.button
            onClick={onAutoplay}
            className={`p-2 rounded-full ${isAutoplay ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-blue-500'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle autoplay"
          >
            ⏯
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Player;