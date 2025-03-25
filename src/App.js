// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ProfileSelection from './pages/ProfileSelection';
import Home from './pages/Home';
import TVShows from './pages/TVShows';
import Movies from './pages/Movies';
import Browse from './pages/Browse';
import NewAndPopular from './pages/NewAndPopular';
import Review from './components/Review';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SystemLogs from './pages/SystemLogs';
import AdminMediaInsert from './pages/AdminMediaInsert';
import WatchlistState from './components/WatchlistState';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Protected routes for regular users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profiles" element={<ProfileSelection />} />
            <Route path="/home" element={<Home />} />
            <Route path="/tvshows" element={<TVShows />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/new-and-popular" element={<NewAndPopular />} />
            <Route path="/review/:mediaId" element={<Review />} />
            
            {/* Catch all route - redirect to home if logged in user tries to access unknown URL */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
          
          {/* Admin-only routes with specialized protection */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/logs" element={<SystemLogs />} />
            <Route path="/admin/media/insert" element={<AdminMediaInsert />} />
          </Route>
        </Routes>
        
        {/* Debug component for development */}
        {process.env.NODE_ENV === 'development' && <WatchlistState />}
      </Router>
    </UserProvider>
  );
}

export default App;
