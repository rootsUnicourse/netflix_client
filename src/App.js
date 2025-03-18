// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ProfileSelection from './pages/ProfileSelection';
import Home from './pages/Home';
import TVShows from './pages/TVShows';
import Review from './components/Review';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <UserProvider> {/* Wrap everything inside UserProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profiles" element={<ProfileSelection />} />
            <Route path="/home" element={<Home />} />
            <Route path="/tvshows" element={<TVShows />} />
            <Route path="/review/:mediaId" element={<Review />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
