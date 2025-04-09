import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Playlist = ({ songs, onRemoveSong, onReorderSongs, onSongClick, currentSong }) => {
  const { theme } = useContext(ThemeContext);

  const handleDragEnd = (result) => {
    if (!result.destination) {
      console.log('No destination for song drag');
      return;
    }
    try {
      const reorderedSongs = Array.from(songs);
      const [removed] = reorderedSongs.splice(result.source.index, 1);
      reorderedSongs.splice(result.destination.index, 0, removed);
      console.log('Reordering songs:', {
        source: result.source.index,
        destination: result.destination.index,
        reorderedSongs,
      });
      
      // Pass both the reordered songs and the drag result to handle current song index update
      onReorderSongs(reorderedSongs, result);
      toast.success('Songs reordered');
    } catch (error) {
      console.error('Song reordering failed:', error);
      toast.error('Failed to reorder songs');
    }
  };

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-4 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="songs">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              {songs.map((song, index) => (
                <Draggable key={`song-${song.id}`} draggableId={`song-${song.id}`} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center p-3 mb-2 rounded ${
                        snapshot.isDragging 
                          ? 'bg-gray-300 dark:bg-gray-600 shadow-lg' 
                          : currentSong && currentSong.id === song.id
                          ? 'bg-blue-100 dark:bg-blue-800 border-2 border-blue-500'
                          : 'bg-white dark:bg-gray-700'
                      } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer z-0`}
                      onClick={() => onSongClick(song)}
                      whileHover={{ scale: 1.02 }}
                      aria-label={`Play ${song.title}`}
                    >
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-12 h-12 mr-4 rounded"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <h3 className={`font-semibold ${currentSong && currentSong.id === song.id ? 'text-blue-600 dark:text-blue-400' : ''}`}>
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </motion.div>
  );
};

export default Playlist;