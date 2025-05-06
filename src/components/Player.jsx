import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playerSize, setPlayerSize] = useState({ width: '100%', height: 'auto' });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const dragControls = useDragControls();
  const playerContainerRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update currentTime and duration for local files
  useEffect(() => {
    const player = playerRef.current;
    if (player && currentSong?.platform === 'local') {
      const updateTime = () => setCurrentTime(player.currentTime);
      const updateDuration = () => setDuration(player.duration || 0);
      player.addEventListener('timeupdate', updateTime);
      player.addEventListener('loadedmetadata', updateDuration);
      return () => {
        player.removeEventListener('timeupdate', updateTime);
        player.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [currentSong, playerRef]);

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (playerRef.current && currentSong?.platform === 'local') {
      playerRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    if (playerRef.current && currentSong?.platform === 'local') {
      playerRef.current.currentTime = newTime;
    }
  };

  const handleResize = () => {
    const container = playerContainerRef.current;
    if (container) {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.5;
      setPlayerSize({
        width: Math.min(container.offsetWidth, maxWidth),
        height: Math.min(container.offsetHeight, maxHeight),
      });
    }
  };

  const isVideo = currentSong && ['video/mp4', 'video/x-matroska', 'youtube', 'yandex'].includes(currentSong.platform);

  return (
    <motion.div
      ref={playerContainerRef}
      className={`p-4 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md shadow-lg border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col resize overflow-hidden`}
      style={{ width: playerSize.width, maxWidth: '90vw', maxHeight: '50vh' }}
      drag
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleResize}
      initial={{ y: 50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isMinimized && currentSong && (
        <div className="flex-1 w-full">
          {isVideo ? (
            currentSong.platform === 'local' ? (
              <video
                ref={playerRef}
                src={currentSong.url}
                controls
                className="w-full h-full rounded-lg object-contain"
                onPlay={() => onPlayPause(true)}
                onPause={() => onPlayPause(false)}
                type={currentSong.file?.type}
              />
            ) : (
              <iframe
                src={currentSong.url}
                className="w-full h-full rounded-lg"
                allow="autoplay"
                title={currentSong.title}
              />
            )
          ) : (
            currentSong.platform === 'local' ? (
              <audio
                ref={playerRef}
                src={currentSong.url}
                className="w-full"
                onPlay={() => onPlayPause(true)}
                onPause={() => onPlayPause(false)}
                type={currentSong.file?.type}
              />
            ) : (
              <iframe
                src={currentSong.url}
                className="w-full h-20"
                allow="autoplay"
                title={currentSong.title}
              />
            )
          )}
          {currentSong?.platform === 'local' && (
            <div className="flex items-center space-x-2 mt-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-blue-500"
                aria-label="Seek position"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {currentSong ? (
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="min-w-0 flex-1 sm:flex-none">
              <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {currentSong.title}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentSong.artist}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative group">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} transition`}
              aria-label={isMinimized ? 'Maximize player' : 'Minimize player'}
            >
              {isMinimized ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              )}
            </button>
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              {isMinimized ? 'Maximize' : 'Minimize'}
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={onShuffle}
              className={`p-2 rounded-full ${isShuffled ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition`}
              aria-label="Toggle shuffle"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5.1 21 12.5l-2.5-2.4v-1.3l-3.3 3.2 3.3 3.3v-1.3L21 11.5l-2.5 2.4 1.4 1.4-4.9-4.9 4 4 4.9 4.9-1.4 1.4-4-4-4 4v1.3l-2.5 2.5-2.5-2.5v-1.3l3.3-3.3-3.3-3.2v1.3L2 3 5.5 8.5l2.5-2.4L10.6 9l4-4-4-4 1.4-3.3 3.2 3.3 3.3-3.3z" />
              </svg>
            </button>
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Shuffle
            </span>
          </div>
          <div className="relative group">


                      <button
              onClick={onPreviousSong}
              className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} transition`}
              aria-label="Previous song"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 3v18l12-9z" transform="rotate(180 12 12)" />
              </svg>
            </button>
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Previous
            </span>
          </div>


          <div className="relative group">
            <button
              onClick={() => onPlayPause(!isPlaying)}
              className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'} transition shadow-md`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              {isPlaying ? 'Pause' : 'Play'}
            </span>
          </div>
          <div className="relative group">
                        <button
              onClick={onNextSong}
              className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} transition`}
              aria-label="Next song"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 3v18l12-9z" />
              </svg>
            </button>
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Next
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={onRepeat}
              className={`p-2 rounded-full ${isRepeat ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition`}
              aria-label="Toggle repeat"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Repeat
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={onAutoplay}
              className={`p-2 rounded-full ${isAutoplay ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition`}
              aria-label="Toggle autoplay"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </button>
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Autoplay
            </span>
          </div>
          <div className="relative group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 sm:w-24 accent-blue-500"
              aria-label="Volume control"
            />
            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Volume
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Player;
