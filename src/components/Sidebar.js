import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Button = styled.button`
  margin-bottom: 10px;
`;

const PlaylistItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: ${(props) => (props.isDragging ? '#f0f0f0' : 'white')};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const PlaylistTitle = styled.span`
  margin-right: 10px;
  cursor: pointer; /* Add cursor style to indicate it's clickable */
`;

const RenamePlaylistInput = styled.input`
  border: none;
  outline: none;
  font-size: inherit;
  padding: 0;
  margin: 0;
`;

// spotify
const fetchAccessToken = async () => {
  const clientId = '179fef3b474847f78013eb58a75ba6b9';
  const clientSecret = '6e5616c73b6e4e3b85db6f375c1f4584';
  
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'client_credentials'
      },
      auth: {
        username: clientId,
        password: clientSecret
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to obtain access token:', error);
    throw error;
  }
};

const fetchSongDetails = async (songUrl) => {
  let platform;
  let id;
  
  if (songUrl.includes('youtube.com')) {
    platform = 'youtube';
    id = songUrl.split('v=')[1];
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${id}&key=AIzaSyCtr1tKLPbZuALc4P5gQpWXYW3fju8lXJQ&part=snippet`);
    const item = response.data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url,
      platform,
    };
  } else if (songUrl.includes('spotify.com')) {
    platform = 'spotify';
    id = songUrl.split('track/')[1];

    try {
      // Obtain the access token
      const accessToken = await fetchAccessToken();

      const response = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return {
        id: response.data.id,
        title: response.data.name,
        artist: response.data.artists[0].name,
        album: response.data.album.name,
        thumbnail: response.data.album.images[0].url,
        platform,
      };
    } catch (error) {
      console.error('Failed to add song:', error);
      throw error;
    }
  } else if (songUrl.includes('soundcloud.com')) {
    platform = 'soundcloud';
    // Extracting ID for SoundCloud is not straightforward
    // You would need to use SoundCloud's resolve endpoint to get the track's ID
  } else {
    throw new Error('Unsupported music platform');
  }
};

const Sidebar = ({ playlists, onSelectPlaylist, onCreatePlaylist, onAddSong, onRemovePlaylist, onRenamePlaylist, onReorderPlaylists }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [isRenaming, setIsRenaming] = useState(null);

  const handleInputChange = (event) => {
    setNewPlaylistName(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    onCreatePlaylist(newPlaylistName);
    setNewPlaylistName('');
  };

  const handleSongUrlChange = (event) => {
    setSongUrl(event.target.value);
  };

  const handleAddSongSubmit = async (event) => {
    event.preventDefault();
    try {
      const songDetails = await fetchSongDetails(songUrl);
      onAddSong(songDetails);
      setSongUrl('');
    } catch (error) {
      console.error('Failed to add song:', error);
    }
  };

  const handleRemovePlaylist = (playlistId) => {
    if (window.confirm('Are you sure you want to remove this playlist?')) {
      onRemovePlaylist(playlistId);
    }
  };

  const handleRenamePlaylist = (playlistId, newName) => {
    onRenamePlaylist(playlistId, newName);
    setIsRenaming(null);
  };

  const handleReorder = (result) => {
    if (!result.destination) return;

    const reorderedPlaylists = Array.from(playlists);
    const [removed] = reorderedPlaylists.splice(result.source.index, 1);
    reorderedPlaylists.splice(result.destination.index, 0, removed);

    onReorderPlaylists(reorderedPlaylists);
  };

  return (
    <SidebarWrapper>
      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="playlists" type="PLAYLIST">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {playlists.map((playlist, index) => (
                <Draggable key={playlist.id.toString()} draggableId={playlist.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <PlaylistItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                      onClick={() => onSelectPlaylist(playlist.id)}
                    >
                      {isRenaming === playlist.id ? (
                        <>
                          <RenamePlaylistInput
                            type="text"
                            value={playlist.name}
                            onChange={(e) => handleRenamePlaylist(playlist.id, e.target.value)}
                            onBlur={() => setIsRenaming(null)}
                            autoFocus
                          />
                        </>
                      ) : (
                        <>
                          <PlaylistTitle>
                            {playlist.name}
                          </PlaylistTitle>
                          <Button onClick={() => setIsRenaming(playlist.id)}>Rename</Button>
                        </>
                      )}
                      <Button onClick={() => handleRemovePlaylist(playlist.id)}>Remove</Button>
                    </PlaylistItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <form onSubmit={handleFormSubmit}>
        <input type="text" value={newPlaylistName} onChange={handleInputChange} />
        <Button type="submit">Create Playlist</Button>
      </form>
      <form onSubmit={handleAddSongSubmit}>
        <input
          type="text"
          value={songUrl}
          onChange={(e) => setSongUrl(e.target.value)}
          placeholder="Song URL"
        />
        <Button type="submit">Add Song</Button>
      </form>
    </SidebarWrapper>
  );
};

export default Sidebar;