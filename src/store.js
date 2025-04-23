import { create } from 'zustand';

export const useStore = create((set) => ({
  playlists: [],
  currentPlaylistId: null,
  setPlaylists: (playlists) => {
    set({ playlists });
    localStorage.setItem('playlists', JSON.stringify(playlists));
  },
  setCurrentPlaylistId: (id) => set({ currentPlaylistId: id }),
  addSong: (song) =>
    set((state) => {
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === state.currentPlaylistId
          ? { ...playlist, songs: [...playlist.songs, song] }
          : playlist
      );
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      return { playlists: updatedPlaylists };
    }),
  removeSong: (songId) =>
    set((state) => {
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === state.currentPlaylistId
          ? {
              ...playlist,
              songs: playlist.songs.filter((song) => song.id !== songId),
            }
          : playlist
      );
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      return { playlists: updatedPlaylists };
    }),
  reorderSongs: (reorderedSongs) =>
    set((state) => {
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === state.currentPlaylistId
          ? { ...playlist, songs: reorderedSongs }
          : playlist
      );
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      return { playlists: updatedPlaylists };
    }),
  createPlaylist: (name) => {
    const newPlaylist = { id: Date.now(), name, songs: [] };
    set((state) => {
      const updatedPlaylists = [...state.playlists, newPlaylist];
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      return { playlists: updatedPlaylists };
    });
    return newPlaylist.id; // Return the new playlist ID
  },
  removePlaylist: (playlistId) =>
    set((state) => {
      const updatedPlaylists = state.playlists.filter(
        (playlist) => playlist.id !== playlistId
      );
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      return {
        playlists: updatedPlaylists,
        currentPlaylistId:
          state.currentPlaylistId === playlistId ? null : state.currentPlaylistId,
      };
    }),
  renamePlaylist: (playlistId, newName) =>
    set((state) => {
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, name: newName } : playlist
      );
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      return { playlists: updatedPlaylists };
    }),
  reorderPlaylists: (reorderedPlaylists) => {
    set({ playlists: reorderedPlaylists });
    localStorage.setItem('playlists', JSON.stringify(reorderedPlaylists));
  },
}));