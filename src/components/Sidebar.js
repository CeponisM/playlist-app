// src/components/Sidebar.js
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
  isAutoplay,
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
    } else {
      toast.error('Playlist name cannot be empty');
    }
  };

  const handleAddLocalSong = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    console.log('File:', file);

    if (!file) {
      console.warn('No file selected');
      toast.error('No file selected');
      return;
    }

    const validTypes = ['audio/mpeg', 'video/mp4', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      console.warn('Invalid file type:', file.type);
      toast.error('Please upload an MP3, MP4, or MKV file');
      return;
    }

    if (!currentPlaylistId) {
      console.warn('No playlist selected');
      toast.error('Please select a playlist');
      return;
    }

    const url = URL.createObjectURL(file);
    let song = {
      id: Date.now(),
      title: file.name || 'Unknown Song',
      artist: 'Unknown',
      album: 'Local',
      thumbnail: 'https://cdn-icons-png.flaticon.com/512/727/727249.png',
      url,
      platform: 'local',
      file, // Store file reference
    };

    try {
      const metadata = await parseBlob(file);
      console.log('Metadata:', metadata);
      song = {
        ...song,
        title: metadata.common.title || file.name,
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Local',
      };
    } catch (error) {
      console.warn('Metadata extraction failed:', error);
      toast.warn('Could not read metadata; using defaults');
    }

    try {
      console.log('Adding song:', song);
      onAddSong(song);
      toast.success('File added');
    } catch (error) {
      console.error('Failed to add song:', error);
      toast.error('Failed to add file');
    }

    e.target.value = '';
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!urlInput) {
      toast.error('URL cannot be empty');
      return;
    }
    if (!currentPlaylistId) {
      toast.error('Please select a playlist first');
      return;
    }

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
          url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1`,
          platform: 'youtube',
        };
      } else if (urlInput.includes('soundcloud.com')) {
        const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(urlInput)}`);
        if (!response.ok) throw new Error('Failed to fetch SoundCloud oEmbed data');
        const data = await response.json();

        let embedUrl = data.html.match(/src="([^"]+)"/)?.[1] || urlInput;
        const urlObj = new URL(embedUrl);
        urlObj.searchParams.set('hide_related', 'true');
        urlObj.searchParams.set('show_comments', 'false');
        urlObj.searchParams.set('show_user', 'true');
        urlObj.searchParams.set('show_reposts', 'false');

        song = {
          id: Date.now(),
          title: data.title || 'SoundCloud Track',
          artist: data.author_name || 'Unknown Artist',
          album: 'SoundCloud',
          thumbnail: data.thumbnail_url || 'https://via.placeholder.com/50',
          url: urlObj.toString(),
          platform: 'soundcloud',
        };
      } else if (urlInput.includes('spotify.com')) {
        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(urlInput)}`);
        if (!response.ok) throw new Error('Failed to fetch Spotify oEmbed data');
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
      console.log('Adding song:', song);
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
      className={`w-full md:w-80 p-4 h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} overflow-y-auto md:overflow-y-auto`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'} bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600`}>
          MelodyHub
        </h1>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-300 text-gray-800'} hover:opacity-80 transition`}
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
        className={`w-full p-2 mb-4 rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        aria-label="Search playlists"
      />
      <div className={`mb-6 p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Your Playlists</h3>
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
                          ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'
                          : snapshot.isDragging
                            ? theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                            : theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                          } hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} transition-colors cursor-pointer touch-none select-none`}
                        onClick={() => onSelectPlaylist(playlist.id)}
                        aria-label={`Select playlist ${playlist.name}`}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {currentPlaylistId === playlist.id && (
                            <span className="text-blue-500">▶</span>
                          )}
                          {isRenaming === playlist.id ? (
                            <input
                              type="text"
                              value={playlist.name}
                              onChange={(e) => onRenamePlaylist(playlist.id, e.target.value)}
                              onBlur={() => setIsRenaming(null)}
                              autoFocus
                              className={`flex-1 bg-transparent border-none outline-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                              aria-label={`Rename playlist ${playlist.name}`}
                            />
                          ) : (
                            <span className="truncate">{playlist.name}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsRenaming(playlist.id); }}
                            className={`text-sm ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            aria-label={`Rename playlist ${playlist.name}`}
                          >
                            Rename
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemovePlaylist(playlist.id); }}
                            className="text-sm text-red-500 hover:text-red-700"
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
            className={`w-full p-2 mb-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-label="New playlist name"
          />
          <button
            type="submit"
            className="w-full p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            aria-label="Create playlist"
          >
            Create Playlist
          </button>
        </form>
      </div>
      {currentPlaylistId && (
        <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Add Media</h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`} htmlFor="file-input">
                Upload Local Media
              </label>
              <input
                id="file-input"
                type="file"
                accept="audio/mpeg,video/mp4,video/x-matroska"
                onChange={handleAddLocalSong}
                className={`w-full p-2 rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label="Upload MP3, MP4, or MKV file"
              />
            </div>
            <form onSubmit={handleAddUrl}>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`} htmlFor="url-input">
                Add YouTube, Spotify, SoundCloud, or Yandex URL
              </label>
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g., https://youtube.com/watch?v=..."
                className={`w-full p-2 rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label="Add media URL"
              />
              <button
                type="submit"
                className="w-full p-2 mt-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
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