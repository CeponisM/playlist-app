import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';

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
  const progressRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const audio = playerRef.current;
    if (audio && currentSong.platform === 'local') {
      audio.volume = volume;
      const updateProgress = () => {
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, [playerRef, volume, currentSong]);

  useEffect(() => {
    if (currentSong.platform !== 'local' && iframeRef.current) {
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
      }
    }
  }, [isPlaying, isAutoplay, currentSong]);

  const handleProgressChange = (e) => {
    const audio = playerRef.current;
    if (audio && currentSong.platform === 'local') {
      const newTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
    if (playerRef.current && currentSong.platform === 'local') {
      playerRef.current.volume = e.target.value;
    }
  };

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
          {currentSong.platform === 'local' ? (
            <div className="w-full">
              <input
                type="range"
                value={progress}
                onChange={handleProgressChange}
                className="w-full accent-blue-500"
                ref={progressRef}
                aria-label="Seek song"
              />
            </div>
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
        </div>
        {currentSong.platform === 'local' && (
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
        className={`fixed bottom-0 left-0 right-0 p-3 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-300'} shadow-lg z-50 flex justify-center items-center`} // High z-index
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
            onClick={onPlayPause}
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