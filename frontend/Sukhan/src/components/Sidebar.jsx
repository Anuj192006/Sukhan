import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, Star, Heart, User, PenTool, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  const navItems = [
    { to: '/', label: 'Feed', icon: <Layout size={20} /> },
    { to: '/top', label: 'Top Poems', icon: <Star size={20} /> },
    { to: '/liked', label: 'Liked', icon: <Heart size={20} /> },
    { to: '/mine', label: 'Your Poems', icon: <PenTool size={20} /> },
    { to: `/profile/${localStorage.getItem('userId')}`, label: 'Profile', icon: <User size={20} /> }
  ];

  return (
    <div className="sidebar" style={{
      width: '25%',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRight: '1px solid var(--border-color)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-secondary)',
      zIndex: 50
    }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="urdu-font" style={{ 
          fontSize: '3rem', 
          color: 'var(--primary)',
          textShadow: '0 0 10px rgba(204, 164, 59, 0.2)'
        }}>Sukhan</h1>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: isActive ? 'var(--bg-primary)' : 'var(--text-muted)',
              background: isActive ? 'var(--primary)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.3s ease'
            })}
          >
            {item.icon}
            <span style={{ fontSize: '1.1rem' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
