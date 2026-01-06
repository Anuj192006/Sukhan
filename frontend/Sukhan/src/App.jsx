import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CreatePoemModal from './components/CreatePoemModal';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import './App.css';

const ProtectedLayout = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar onOpenCreate={() => setShowCreateModal(true)} />
      
      <div className="main-content">
        <Outlet />
      </div>

      {showCreateModal && (
        <CreatePoemModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            window.location.reload(); 
          }}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Feed endpoint="/poems/feed" title="Your Feed" isRandom={true} />} />
          <Route path="/top" element={<Feed endpoint="/poems/top" title="Top Verses" />} />
          <Route path="/liked" element={<Feed endpoint="/poems/liked" title="Liked Poems" />} />
          <Route path="/mine" element={<Feed endpoint="/poems/mine" title="My Ink" />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
