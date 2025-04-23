import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ThemeContext } from '../context/ThemeContext';
import { parseBlob } from 'music-metadata-browser';
import toast from 'react-hot-toast';

const Sidebar = ({
  playlists,
  onSelectPlaylist,
  onCreatePlaylist,
  onAddSong,
  onRemovePlaylist,
  onRenamePlaylist,
  onReorderPlaylists,
  currentPlaylistId,
  isAutoplay, // Added prop
}) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isRenaming, setIsRenaming] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      const newPlaylistId = onCreatePlaylist(newPlaylistName);
      setNewPlaylistName('');
      onSelectPlaylist(newPlaylistId);
    }
  };

  const handleAddLocalSong = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file && file.type === 'audio/mp3') {
      const url = URL.createObjectURL(file);
      try {
        const metadata = await parseBlob(file);
        const picture = metadata.common.picture?.[0];
        const song = {
          id: Date.now(),
          title: metadata.common.title || file.name,
          artist: metadata.common.artist || 'Unknown Artist',
          album: metadata.common.album || 'Unknown Album',
          thumbnail: picture
            ? `data:${picture.format};base64,${Buffer.from(picture.data).toString('base64')}`
            : 'https://via.placeholder.com/50',
          url,
          platform: 'local',
        };
        onAddSong(song);
        toast.success('Content added successfully');
      } catch (error) {
        console.error('Metadata read error:', error);
        toast.error('Failed to read metadata; using default values');
        const song = {
          id: Date.now(),
          title: file.name,
          artist: 'Unknown Artist',
          album: 'Local',
          thumbnail: 'https://via.placeholder.com/50',
          url,
          platform: 'local',
        };
        onAddSong(song);
      }
    } else {
      toast.error('Please upload a valid MP3 file');
    }
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!urlInput) return;
    let song = { id: Date.now(), platform: 'unknown' };

    try {
      if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
        const videoId = urlInput.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        if (!videoId) throw new Error('Invalid YouTube URL');

        let title = 'YouTube Video';
        let artist = 'Unknown Artist';
        let thumbnail = `https://img.youtube.com/vi/${videoId}/default.jpg`;

        try {
          const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (!response.ok) throw new Error('Failed to fetch YouTube oEmbed data');
          const data = await response.json();
          title = data.title || title;
          artist = data.author_name || artist;
          thumbnail = data.thumbnail_url || thumbnail;
        } catch (oEmbedError) {
          console.error('YouTube oEmbed fetch failed:', oEmbedError);
          toast.warn('Could not fetch YouTube metadata; using default values');
        }

        song = {
          id: Date.now(),
          title,
          artist,
          album: 'YouTube',
          thumbnail,
          url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${isAutoplay ? 1 : 0}`,
          platform: 'youtube',
        };
      } else if (urlInput.includes('soundcloud.com')) {
        const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(urlInput)}`);
        const data = await response.json();
        song = {
          id: Date.now(),
          title: data.title || 'SoundCloud Track',
          artist: data.author_name || 'Unknown Artist',
          album: 'SoundCloud',
          thumbnail: data.thumbnail_url || 'https://via.placeholder.com/50',
          url: data.html.match(/src="([^"]+)"/)?.[1] || urlInput,
          platform: 'soundcloud',
        };
      } else if (urlInput.includes('spotify.com')) {
        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(urlInput)}`);
        const data = await response.json();
        song = {
          id: Date.now(),
          title: data.title || 'Spotify Track',
          artist: data.author_name || 'Unknown Artist',
          album: 'Spotify',
          thumbnail: data.thumbnail_url || 'https://via.placeholder.com/50',
          url: data.html.match(/src="([^"]+)"/)?.[1] || urlInput,
          platform: 'spotify',
        };
      } else if (urlInput.includes('yandex')) {
        song = {
          id: Date.now(),
          title: 'Yandex Track',
          artist: 'Unknown Artist',
          album: 'Yandex',
          thumbnail: 'https://via.placeholder.com/50',
          url: urlInput,
          platform: 'yandex',
        };
      } else {
        throw new Error('Unsupported URL');
      }
      onAddSong(song);
      toast.success('Content added successfully');
      setUrlInput('');
    } catch (error) {
      console.error('URL processing error:', error);
      toast.error('Failed to add URL; please check the link');
    }
  };

  const handleDragEnd = (result) => {
    if (!result?.destination) return;
    const reorderedPlaylists = Array.from(playlists);
    const [removed] = reorderedPlaylists.splice(result.source.index, 1);
    reorderedPlaylists.splice(result.destination.index, 0, removed);
    onReorderPlaylists(reorderedPlaylists);
  };

  const filteredPlaylists = playlists.filter((p) =>
    p.name?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      className={`w-full md:w-80 p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} overflow-y-auto`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Playlists</h2>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full bg-gray-300 dark:bg-gray-700"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
            </button>
        </div>
        <input
          type="text"
          placeholder="Search playlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          aria-label="Search playlists"
        />
      <div className="mb-6 p-4 rounded-lg shadow-md bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Your Playlists</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="playlists">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {filteredPlaylists.map((playlist, index) => (
                  <Draggable key={playlist.id} draggableId={playlist.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex justify-between items-center p-3 mb-2 rounded ${currentPlaylistId === playlist.id
                            ? 'bg-blue-100 dark:bg-blue-600'
                            : snapshot.isDragging
                            ? 'bg-gray-100 dark:bg-gray-600'
                            : 'bg-white dark:bg-gray-700'
                            } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer`}
                        onClick={() => onSelectPlaylist(playlist.id)}
                        aria-label={`Select playlist ${playlist.name}`}
                      >
                        <div className="flex items-center space-x-2">
                          {currentPlaylistId === playlist.id && (
                            <span className="text-blue-300">▶</span>
                          )}
                          {isRenaming === playlist.id ? (
                            <input
                              type="text"
                              value={playlist.name}
                              onChange={(e) => onRenamePlaylist(playlist.id, e.target.value)}
                              onBlur={() => setIsRenaming(null)}
                              autoFocus
                              className={`flex-1 bg-transparent border-none outline-none outline-none ${currentPlaylistId === playlist.id ? 'text-blue-gray-900' : ''}`}
                              aria-label={`Rename playlist ${playlist.name}`}
                            />
                          ) : (
                            <span>{playlist.name}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setIsRenaming(playlist.id)}
                            className="text-sm"
                            aria-label={`Rename playlist ${playlist.name}`}
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => onRemovePlaylist(playlist.id)}
                            className="text-sm text-red-500"
                            aria-label={`Remove playlist ${playlist.name}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <form onSubmit={handleCreatePlaylist}>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New Playlist"
            className="w-full p-2 mb-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-400"
            aria-label="New playlist name"
          />
          <button
            type="submit"
            className="w-full p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Create playlist"
          >
            Create Playlist
          </button>
        </form>
      </div>

      {currentPlaylistId && (
        <div className="p-4 rounded-lg shadow-md bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700">
          <h3 class="text-blue-700" className="text-lg font-semibold mb-4 dark:text-blue-400">Add Media</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" for="file-input">
                Upload Local MP3
              </label>
              <input
                id="file-input"
                type="file"
                accept="audio/mp3"
                onChange={handleAddLocalSong}
                className="w-full p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                aria-label="Upload MP3 file"
              />
            </div>
            <form onSubmit={handleAddUrl}>
              <label class="block" className="block text-sm font-medium mb-2" for="url-input">
                Add YouTube, Spotify, SoundCloud, or Yandex URL
              </label>
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g., https://youtube.com/watch?v=..."
                class="w-full" className="w-full p-2 rounded bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-200 border-gray-300 dark:border-blue-600"
                aria-label="Add media URL"
              />
              <button
                type="submit"
                className="w-full p-2 mt-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Add Media"
              >
                Add Media
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;