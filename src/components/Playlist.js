import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Playlist = ({ songs, onRemoveSong, onReorderSongs, onSongClick, currentSong }) => {
  const { theme } = useContext(ThemeContext);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // Allow dropping
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex) return;

    try {
      const reorderedSongs = Array.from(songs);
      const [draggedSong] = reorderedSongs.splice(dragIndex, 1);
      reorderedSongs.splice(dropIndex, 0, draggedSong);
      
      onReorderSongs(reorderedSongs, { source: { index: dragIndex }, destination: { index: dropIndex } });
      toast.success('Songs reordered');
    } catch (error) {
      console.error('Song reordering failed:', error);
      toast.error('Failed to reorder songs');
    } finally {
      setDraggedIndex(null);
      document.querySelectorAll('.song-item').forEach((el) => {
        el.style.opacity = '1';
      });
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    document.querySelectorAll('.song-item').forEach((el) => {
      el.style.opacity = '1';
    });
  };

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-4 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-[100px]">
        {songs.map((song, index) => (
          <motion.div
            key={`song-${song.id}`}
            className={`song-item flex items-center p-3 mb-2 rounded ${
              draggedIndex === index
                ? 'bg-gray-300 dark:bg-gray-600 shadow-lg'
                : currentSong && currentSong.id === song.id
                ? 'bg-blue-100 dark:bg-blue-800 border-2 border-blue-500'
                : 'bg-white dark:bg-gray-700'
            } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-move`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSongClick(song)}
            whileHover={{ scale: 1.02 }}
            style={{ zIndex: draggedIndex === index ? 1000 : 0 }}
            aria-label={`Play ${song.title}`}
          >
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-12 h-12 mr-4 rounded"
              loading="lazy"
            />
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  currentSong && currentSong.id === song.id ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                {song.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
              {song.album && (
                <p className="text-sm text-gray-500 dark:text-gray-500">{song.album}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-500">{song.platform}</p>
            </div>
            {currentSong && currentSong.id === song.id && (
              <div className="mr-4 text-blue-500">
                <span className="text-lg">♪</span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSong(song.id);
              }}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${song.title}`}
            >
              Remove
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Playlist;