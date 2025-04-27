import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Playlist = ({ songs, onRemoveSong, onReorderSongs, onSongClick, currentSong }) => {
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };
  const { theme } = useContext(ThemeContext);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex) return;

    const reorderedSongs = [...songs];
    const [draggedSong] = reorderedSongs.splice(dragIndex, 1);
    reorderedSongs.splice(dropIndex, 0, draggedSong);
    onReorderSongs(reorderedSongs, { source: { index: dragIndex }, destination: { index: dropIndex } });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    document.querySelectorAll('.song-item').forEach((el) => {
      el.style.opacity = '1';
    });
  };

  return (
    <motion.div
      className="flex-1 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">Playlist</h2>
      <div className="space-y-2">
        {songs.map((song, index) => (
          <div
            key={song.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center p-2 rounded cursor-pointer ${
              currentSong?.id === song.id
                ? 'bg-blue-100 dark:bg-blue-600'
                : 'bg-white dark:bg-gray-700'
            } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
            onClick={() => onSongClick(song)}
          >
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-10 h-10 object-cover rounded mr-3"
              onError={(e) => {
                e.target.src = 'https://cdn-icons-png.flaticon.com/512/727/727249.png'; // Fallback icon
              }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-gray-900 dark:text-white truncate"
                title={song.title} // Full title on hover
              >
                {song.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{song.artist}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSong(song.id);
              }}
              className="ml-2 text-red-500 hover:text-red-700"
              aria-label={`Remove ${song.title}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Playlist;