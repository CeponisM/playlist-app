import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      playlists: [],
      currentPlaylistId: null,
      setPlaylists: (playlists) => set({ playlists }, false, 'setPlaylists'),
      addSong: (song) =>
        set(
          (state) => ({
            playlists: state.playlists.map((p) =>
              p.id === state.currentPlaylistId ? { ...p, songs: [...p.songs, song] } : p
            ),
          }),
          false,
          'addSong'
        ),
      removeSong: (songId) =>
        set(
          (state) => ({
            playlists: state.playlists.map((p) =>
              p.id === state.currentPlaylistId
                ? { ...p, songs: p.songs.filter((s) => s.id !== songId) }
                : p
            ),
          }),
          false,
          'removeSong'
        ),
      reorderSongs: (newSongs) =>
        set(
          (state) => ({
            playlists: state.playlists.map((p) =>
              p.id === state.currentPlaylistId ? { ...p, songs: newSongs } : p
            ),
          }),
          false,
          'reorderSongs'
        ),
      createPlaylist: (name) =>
        set(
          (state) => ({
            playlists: [...state.playlists, { id: Date.now(), name, songs: [] }],
          }),
          false,
          'createPlaylist'
        ),
      removePlaylist: (playlistId) =>
        set(
          (state) => ({
            playlists: state.playlists.filter((p) => p.id !== playlistId),
          }),
          false,
          'removePlaylist'
        ),
      renamePlaylist: (playlistId, newName) =>
        set(
          (state) => ({
            playlists: state.playlists.map((p) =>
              p.id === playlistId ? { ...p, name: newName } : p
            ),
          }),
          false,
          'renamePlaylist'
        ),
      reorderPlaylists: (playlists) => set({ playlists }, false, 'reorderPlaylists'),
      setCurrentPlaylistId: (id) => set({ currentPlaylistId: id }, false, 'setCurrentPlaylistId'),
    }),
    {
      name: 'playlists-storage',
      storage: localStorage,
    }
  )
);