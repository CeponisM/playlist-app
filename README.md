
# Music Player App

A modern, web-based music player built with React, supporting playback of local MP3 files and streaming from YouTube, Spotify, SoundCloud, and Yandex Music. It features a responsive and themeable UI, playlist management, and smooth playback controls.

## Features

### Multi-Platform Playback
- Local MP3: Upload and play with metadata extraction (title, artist, album, thumbnail).
- YouTube: Embed video playback via iframe, with oEmbed metadata.
- Spotify & SoundCloud: Playback via iframe embeds and oEmbed for metadata.
- Yandex Music: Direct playback with fallback metadata.

### Playlist Management
- Create, rename, and delete playlists.
- Auto-select new playlists.
- Add songs by local file or URL.
- Drag-and-drop to reorder playlists and songs.

### Playback Controls
- Play/pause, next/previous song.
- Shuffle, repeat, and autoplay support.
- Song selection overrides shuffle mode.
- Progress bar for local MP3 and YouTube.

### UI/UX
- Responsive design with light/dark mode.
- Smooth animations via Framer Motion.
- Toast notifications for actions and errors.
- Searchable playlist list.

### Performance
- Custom drag-and-drop for large song lists.
- Debounced input to prevent rapid submissions.

## Getting Started

### Prerequisites
- Node.js v14 or higher
- Modern browser: Chrome, Firefox, Edge, Safari
- Internet connection (for streaming content)

### Router Base Path Setup

This project is configured to run under the `/15` base path both in the React Router and the build output:

- The `"homepage": "/15"` field in `package.json` ensures that the production build assets are served correctly from the `/15` subdirectory.
- The React Router is wrapped with `<Router basename="/15">` so that all routes work relative to this base path.

This setup is useful when the app is deployed in a subfolder instead of the root domain.

### Installation

Clone the repository:
```bash
git clone https://github.com/CeponisM/playlist-app.git
cd music-player-app
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3000

## Usage

### Create a Playlist
1. Enter a name in the sidebar under “New Playlist”
2. Click "Create Playlist"

### Add Songs
- Local MP3: Click "Upload Local MP3", select a file — metadata is auto-extracted.
- Streaming URL: Paste a URL (YouTube, Spotify, SoundCloud, Yandex) and click "Add Media".

### Manage Playlists
- Click a playlist to select it.
- Rename or remove via buttons.
- Drag and drop to reorder.

### Manage Songs
- Click a song to play.
- Remove to delete.
- Drag and drop to change order.

### Playback Controls
- Toggle play/pause
- Next / Previous
- Enable/disable shuffle, repeat, autoplay

### Theme Toggle
Click the sun/moon icon in the sidebar to switch themes.

## Tech Stack

### Libraries Used
- react, react-dom — Core framework
- zustand — State management
- framer-motion — Animations
- react-beautiful-dnd — Playlist drag-and-drop
- music-metadata-browser — MP3 metadata
- lodash.debounce — Input debouncing
- react-hot-toast — Toast notifications
- react-player — Fallback for streaming
- styled-components, tailwindcss — Styling

### File Structure

```
music-player-app/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Sidebar.js
│   │   ├── Player.js
│   │   └── Playlist.js
│   ├── context/
│   │   └── ThemeContext.js
│   ├── store.js
│   ├── HomePage.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Known Limitations

- Autoplay: Some browsers block autoplay for streaming content without user interaction.
- YouTube oEmbed: Fallback metadata used if API fails.
- Yandex Music: No oEmbed; uses fallback metadata.
- Touch Drag-and-Drop: May need refinement for mobile.

## Contributing

1. Fork the repository
2. Create a branch: git checkout -b feature/your-feature
3. Commit: git commit -m "Add your feature"
4. Push: git push origin feature/your-feature
5. Open a Pull Request

Please follow existing coding style, write tests if applicable, and update the README if needed.

## License

Licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

Built with React. Inspired by modern music apps. Thanks to open-source libraries:
- Framer Motion
- React Beautiful DnD
- Music Metadata Browser
- Zustand
- React Hot Toast
