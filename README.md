# Multimedia Hub — Premium Multimedia Management System

A production-grade, full-stack multimedia platform designed to discover, stream, upload, organize, search, favorite, and manage video clips, audio tracks, digital artwork, and technical documents.

---

## 🌟 Key Features

### 🎬 Video Streaming System
- Custom HTML5 Video Player with play/pause, scrub bar, buffer indicator, volume/mute, and time tooltips.
- Speed controls (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x).
- Picture-in-Picture (PiP) and Fullscreen support.
- Full keyboard shortcuts (`Space` to toggle playback, `←`/`→` to seek 5s, `↑`/`↓` for volume, `F` for fullscreen, `M` for mute).
- Resume watch progress & automatic watch history tracking in SQLite.
- Interactive 5-star ratings & written user reviews.

### 🎵 Global Audio / Music Player
- Global floating/docked audio player that persists playback across route navigation.
- Real synthesized PCM audio synthesis & HTML5 Audio streaming.
- Play, Pause, Next, Previous, Seek, Volume, Mute, Shuffle, and Repeat modes (`off`, `all`, `one`).
- Slide-out Play Queue drawer to reorder, view, and jump across tracks.
- "Play All" queue launcher for playlists and albums.

### 🖼️ Digital Art & Photography Gallery
- Masonry-styled visual gallery grid.
- Fullscreen Lightbox viewer with zoom in/out, pan, reset zoom, next/previous keyboard navigation, and full-resolution download.

### 📄 Document Reading System
- In-browser PDF embed / iframe viewer.
- Real-time text document viewer with formatted font rendering.
- Direct downloads with metadata (file size, mime type, upload timestamp).

### 📤 Multi-Format Upload System
- Real Multer-backed multipart file handling with safe disk storage (`uploads/videos`, `uploads/audio`, `uploads/images`, `uploads/documents`, `uploads/thumbnails`, `uploads/avatars`).
- Automatic file format and media type detection.
- Live progress bar using native `XMLHttpRequest.upload.onprogress`.
- File validation (type, required fields, 100MB limit).

### 🔍 Advanced Search & Taxonomy
- Real-time backend search across title, description, tags, and category.
- Instant debounced live suggestions.
- Media type breakdown counters.
- Multi-criteria filtering (category dropdown, media type tabs, 1-5 star ratings, sorting by popularity, date, or title).

### 📂 Playlists & Favorites
- Curate public and private playlists.
- Add and remove items with custom order indexes.
- Toggle favorites persisted in the relational database.

### 🛡️ Administration Portal
- Protected Admin routes (`/admin`, `/admin/users`, `/admin/media`, `/admin/categories`).
- Comprehensive KPI dashboard (users, media items, views, storage metrics).
- Manage user roles (`USER` <-> `ADMIN`) and account deletions.
- Manage system-wide media files and disk cleanups.
- Dynamic category creation and taxonomy management.

### 🌓 User Preferences & Theming
- Native Dark and Light themes with persistent state.
- Autoplay toggles, master volume, and playback speed defaults.
- Toast notifications system.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router 6, Lucide React icons, HTML5 Audio & Video APIs.
- **Backend**: Node.js v24, Express.js REST API, Morgan logger, CORS, Multer.
- **Database**: SQLite with Node.js native `DatabaseSync` (`node:sqlite`) — zero native C++ compilation needed, ultra-fast synchronous prepared statements with WAL mode and foreign-key cascades.
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing.

---

## 📁 Project Structure

```
MultimediaSystemWebsite/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── common/         # Navbar, Sidebar, MobileNav, Toast, Modal, Pagination, RatingStars
│       │   ├── media/          # MediaCard, MediaGrid, FilterBar, Lightbox
│       │   ├── player/         # GlobalAudioPlayer, VideoPlayerModal, DocumentViewerModal
│       │   └── playlist/       # AddToPlaylistModal, CreatePlaylistModal
│       ├── context/            # AuthContext, PlayerContext, ThemeContext, ToastContext
│       ├── hooks/              # useDebounce
│       ├── pages/              # Home, Explore, Videos, Music, Images, Documents, Playlists, etc.
│       │   └── admin/          # AdminDashboard, AdminUsers, AdminMedia, AdminCategories
│       ├── services/           # api.js
│       └── utils/              # formatters.js
├── server/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── config/
│   │   └── db.js               # Database schema & SQLite initialization
│   ├── controllers/            # auth, media, category, playlist, favorite, history, rating, admin
│   ├── middleware/             # auth, upload (Multer), errorHandler
│   ├── routes/                 # Express REST route handlers
│   ├── services/
│   │   └── seedService.js      # Media generation and seed script
│   ├── test_e2e.js             # End-to-end integration test suite
│   ├── data/
│   │   └── multimedia.sqlite   # SQLite database file
│   └── uploads/                # Local uploaded binary media
└── package.json                # Root automation scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v22.5.0 or higher (Node v24 recommended)
- **NPM**: v10+

### 2. Installation
Install dependencies for all workspaces:
```bash
npm run install:all
```
*(Or run `npm install` inside root, `server/`, and `client/` separately).*

### 3. Database Setup & Seeding
To populate categories, sample synthesized tracks, CC0 videos, high-resolution artwork, technical PDFs, and test accounts:
```bash
npm run seed
```

### 4. Running the Application
You can run both client and backend concurrently from the root directory:
```bash
npm start
```

Or run them in separate terminals:
- **Backend (Port 5000)**:
  ```bash
  npm run server
  ```
- **Frontend (Port 5173)**:
  ```bash
  npm run client
  ```

---

## 🔑 Default Accounts

The seed script creates the following ready-to-use accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@multimediahub.com` | `AdminPassword123!` |
| **Standard User** | `user@multimediahub.com` | `UserPassword123!` |

*(Both accounts can also be auto-filled with one click on the Sign In page!)*

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch active user profile and stats | Yes |
| `GET` | `/api/media` | Paginated catalog with filters & sorting | Optional |
| `GET` | `/api/media/dashboard` | Curated dashboard collections | Optional |
| `GET` | `/api/media/search` | Search titles, tags, and descriptions | No |
| `POST` | `/api/media` | Upload media file with metadata | Yes |
| `DELETE`| `/api/media/:id` | Delete media file (owner or admin) | Yes |
| `POST` | `/api/favorites/toggle`| Toggle media favorite status | Yes |
| `GET` | `/api/playlists` | Fetch user and public playlists | Optional |
| `POST` | `/api/playlists` | Create new playlist | Yes |
| `POST` | `/api/history` | Record playback progress | Yes |
| `POST` | `/api/ratings` | Submit 1-5 star review | Yes |
| `GET` | `/api/admin/stats` | System KPI metrics | Admin |
| `GET` | `/api/admin/users` | Manage registered accounts | Admin |
| `GET` | `/api/admin/media` | Manage all system uploads | Admin |

---

## 🧪 Testing

An automated end-to-end integration test suite is included:
```bash
cd server
node test_e2e.js
```
This tests all 9 core subsystems: health, auth, duplicate prevention, media catalog, favorites, 5-star ratings, watch history tracking, playlists lifecycle, and admin privileges.
