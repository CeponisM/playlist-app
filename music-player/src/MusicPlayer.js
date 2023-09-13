import React, { useState } from 'react';

const MusicPlayer = () => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playSong = () => {
        setIsPlaying(true);
    };
    
    const pauseSong = () => {
        setIsPlaying(false);
    };

    return (
        <div>
          <button onClick={playSong}>Play</button>
          <button onClick={pauseSong}>Pause</button>
        </div>
    );
};