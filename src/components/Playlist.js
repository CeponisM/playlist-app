import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

const Song = styled.div.attrs(props => ({
  style: {
    backgroundColor: props.isDragging ? '#f0f0f0' : 'white',
  },
}))`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  margin-right: 10px;
`;

const Title = styled.h2`
  margin: 0;
`;

const Artist = styled.p`
  margin: 0;
`;

const Album = styled.p`
  margin: 0;
`;

const RemoveButton = styled.button`
  margin-left: auto;
`;

const Playlist = ({ songs, onRemoveSong, onReorderSongs, onSongClick }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedSongs = Array.from(songs);
    const [removed] = reorderedSongs.splice(result.source.index, 1);
    reorderedSongs.splice(result.destination.index, 0, removed);

    onReorderSongs(reorderedSongs);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="playlist">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {songs.map((song, index) => (
              <Draggable key={song.id} draggableId={song.id} index={index}>
                {(provided, snapshot) => (
                  <Song
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onSongClick(song)}
                    isDragging={snapshot.isDragging}
                  >
                    <Thumbnail src={song.thumbnail} alt={song.title} />
                    <div>
                      <Title>{song.title}</Title>
                      <Artist>{song.artist}</Artist>
                      <Album>{song.album}</Album>
                    </div>
                    <RemoveButton onClick={() => onRemoveSong(song.id)}>Remove</RemoveButton>
                  </Song>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Playlist;
