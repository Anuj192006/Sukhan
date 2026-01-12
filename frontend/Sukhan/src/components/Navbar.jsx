import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onOpenCreate }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
        navigate(`/users/search?q=${encodeURIComponent(search)}`);
        
    }
  };

  return (
    <div className="glass navbar" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '75%',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 40,
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div className="search-container" style={{ position: 'relative', width: '400px' }}>
        <Search style={{ 
          position: 'absolute', 
          left: '12px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }} size={18} />
        <input 
          type="text" 
          placeholder="Search poets..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={{ 
            paddingLeft: '40px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={onOpenCreate}
          style={{
            background: 'var(--primary)',
            color: 'var(--bg-primary)',
            padding: '10px 20px',
            borderRadius: '20px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserPlus size={18} />
          Create Poem
        </button>
        
        <button 
           onClick={() => navigate(`/profile/${localStorage.getItem('userId')}`)}
           style={{
             width: '40px', 
             height: '40px', 
             borderRadius: '50%', 
             background: 'var(--gradient-1)',
             border: '1px solid var(--border-color)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}
        >
           <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#333' }} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
