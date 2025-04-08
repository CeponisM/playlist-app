import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Playlist = ({ songs, onRemoveSong, onReorderSongs, onSongClick }) => {
  const { theme } = useContext(ThemeContext);

  const handleDragEnd = (result) => {
    if (!result.destination) {
      console.log('No destination for drag');
      return;
    }
    try {
      const reorderedSongs = Array.from(songs);
      const [removed] = reorderedSongs.splice(result.source.index, 1);
      reorderedSongs.splice(result.destination.index, 0, removed);
      console.log('Reordering songs:', { source: result.source.index, destination: result.destination.index, reorderedSongs });
      onReorderSongs(reorderedSongs);
      toast.success('Playlist reordered');
    } catch (error) {
      console.error('Reordering failed:', error);
      toast.error('Failed to reorder playlist');
    }
  };

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-4 pb-20" // Added padding-bottom to avoid control overlap
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="playlist">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`min-h-[100px] ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              {songs.map((song, index) => (
                <Draggable key={song.id} draggableId={song.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center p-3 mb-2 rounded ${
                        snapshot.isDragging ? 'bg-gray-300 dark:bg-gray-600 shadow-lg' : 'bg-white dark:bg-gray-700'
                      } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer z-0`} // Lower z-index
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
                        <h3 className="font-semibold">{song.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
                        {song.album && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">{song.album}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-500">{song.platform}</p>
                      </div>
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