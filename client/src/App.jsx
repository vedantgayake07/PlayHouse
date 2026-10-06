import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Common Shell Components
import { Navbar } from './components/common/Navbar.jsx';
import { Sidebar } from './components/common/Sidebar.jsx';
import { MobileNav } from './components/common/MobileNav.jsx';
import { ToastContainer } from './components/common/Toast.jsx';

// Player Modals & Lightbox
import { GlobalAudioPlayer } from './components/player/GlobalAudioPlayer.jsx';
import { VideoPlayerModal } from './components/player/VideoPlayerModal.jsx';
import { DocumentViewerModal } from './components/player/DocumentViewerModal.jsx';
import { Lightbox } from './components/media/Lightbox.jsx';

// Pages
import { Home } from './pages/Home.jsx';
import { Explore } from './pages/Explore.jsx';
import { Videos } from './pages/Videos.jsx';
import { Music } from './pages/Music.jsx';
import { Images } from './pages/Images.jsx';
import { Documents } from './pages/Documents.jsx';
import { MyUploads } from './pages/MyUploads.jsx';
import { Categories } from './pages/Categories.jsx';
import { About } from './pages/About.jsx';
import { Playlists } from './pages/Playlists.jsx';
import { PlaylistDetail } from './pages/PlaylistDetail.jsx';
import { Favorites } from './pages/Favorites.jsx';
import { History } from './pages/History.jsx';
import { Upload } from './pages/Upload.jsx';
import { Search } from './pages/Search.jsx';
import { Profile } from './pages/Profile.jsx';
import { Settings } from './pages/Settings.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminUsers } from './pages/admin/AdminUsers.jsx';
import { AdminMedia } from './pages/admin/AdminMedia.jsx';
import { AdminCategories } from './pages/admin/AdminCategories.jsx';

// Protected Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Checking authorization...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Verifying session...</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Verifying administrative rights...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Toast Notification Mount */}
      <ToastContainer />

      {/* Global Interactive Media Overlays */}
      <VideoPlayerModal />
      <DocumentViewerModal />
      <Lightbox />

      {/* Sidebar Navigation Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main App Layout */}
      <div className="main-wrapper" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="main-content">
          <Routes>
            {/* Authentication (Public Only - Redirects to / if logged in) */}
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

            {/* Protected Core Dashboard & Discovery */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
            <Route path="/movies" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
            <Route path="/music" element={<ProtectedRoute><Music /></ProtectedRoute>} />
            <Route path="/images" element={<ProtectedRoute><Images /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Playlists */}
            <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="/playlists/:id" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />

            {/* User Personal Spaces */}
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/my-uploads" element={<ProtectedRoute><MyUploads /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/media" element={<AdminRoute><AdminMedia /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Persistent Media Player */}
        <GlobalAudioPlayer />

        {/* Mobile View Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <PlayerProvider>
              <AppShell />
            </PlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
