import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/profile/${user.id}`)}
      className="glass"
      style={{
        padding: '1.5rem',
        marginBottom: '1rem',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'var(--gradient-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <User size={24} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>{user.name}</h3>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {user._count?.poems || 0} poems penned
        </span>
      </div>
    </div>
  );
};

export default UserCard;