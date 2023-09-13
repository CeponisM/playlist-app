import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PlayerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Button = styled.button`
  margin: 0 10px;
`;

const SongDetails = styled.div`
  margin-left: auto;
`;

const Player = ({
  playlist,
  songs,
  setCurrentSongIndex,
  currentSongIndex,
  currentSong,
  isPlaying,
  onPlayPause,
  onNextSong,
  onPreviousSong,
  onShuffle,
}) => {
  const [playerUrl, setPlayerUrl] = useState(null);

  useEffect(() => {
    if (currentSong) {
      setPlayerUrl(getEmbeddedPlayer(songs[currentSongIndex]));
    }
  }, [currentSong]);

  useEffect(() => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.addEventListener('ended', () =>
        setCurrentSongIndex((currentSongIndex + 1) % playlist.length)
      );
    }
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', () =>
          setCurrentSongIndex((currentSongIndex + 1) % playlist.length)
        );
      }
    };
  }, [currentSongIndex]);

  const getEmbeddedPlayer = (song) => {
    if (!song || !song.platform || !song.id) {
      console.error("Invalid song data:", song);
      return null;
    }

    try {
      if (song.platform === 'youtube') {
        return (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${song.id}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      } else if (song.platform === 'soundcloud' && song.id) {
        // ... SoundCloud embed logic ...
      } else if (song.platform === 'spotify' && song.id) {
          return (
            <iframe
              src={`https://open.spotify.com/embed/track/${song.id}`}
              width="560"
              height="315"
              frameBorder="0"
              allowTransparency="true"
              allow="encrypted-media"
            ></iframe>
          );
        } else {
        console.error("Unsupported music platform or missing URL/id:", song.platform);
        return null;
      }
    } catch (error) {
      console.error("Error getting embedded player: ", error);
      return null;
    }
  };

  if (!songs[currentSongIndex]) {
    return null; // Don't render the component if currentSong is undefined
  }

  return (
    <PlayerWrapper>
      <Button onClick={onPreviousSong}>Previous</Button>
      <Button onClick={onPlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
      <Button onClick={onNextSong}>Next</Button>
      <Button onClick={onShuffle}>Shuffle</Button>
      {/* Add other controls here */}
      <SongDetails>
        {/* Render the embedded player */}
        {playerUrl}
      </SongDetails>
    </PlayerWrapper>
  );
};

export default Player;