import React, { useContext } from 'react';
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

  return (
    <motion.div
      className={`p-4 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md shadow-lg border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row items-center justify-between gap-4`}
      initial={{ y: 50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
        <button
          onClick={onShuffle}
          className={`p-2 rounded-full ${isShuffled ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition`}
          aria-label="Toggle shuffle"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.5.1 21 12.5l-2.5-2.4v-1.3l-3.3 3.2 3.3 3.3v-1.3L21 11.5l-2.5 2.4 1.4 1.4-4.9-4.9 4 4 4.9 4.9-1.4 1.4-4-4-4 4v1.3l-2.5 2.5-2.5-2.5v-1.3l3.3-3.3-3.3-3.2v1.3L2 3 5.5 8.5l2.5-2.4L10.6 9l4-4-4-4 1.4-3.3 3.2 3.3 3.3-3.3z" />
          </svg>
        </button>
        <button
          onClick={onPreviousSong}
          className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} transition`}
          aria-label="Previous song"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 3v18l12-9z" />
          </svg>
        </button>
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
        <button
          onClick={onNextSong}
          className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} transition`}
          aria-label="Next song"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 3v18l12-9z" transform="rotate(180 12 12)" />
          </svg>
        </button>
        <button
          onClick={onRepeat}
          className={`p-2 rounded-full ${isRepeat ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition`}
          aria-label="Toggle repeat"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        </button>
        <button
          onClick={onAutoplay}
          className={`p-2 rounded-full ${isAutoplay ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} transition`}
          aria-label="Toggle autoplay"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        </button>
      </div>
      {currentSong?.platform !== 'local' && (
        <iframe
          src={currentSong.url}
          className="hidden"
          allow="autoplay"
          title={currentSong.title}
        />
      )}
    </motion.div>
  );
};

export default Player;