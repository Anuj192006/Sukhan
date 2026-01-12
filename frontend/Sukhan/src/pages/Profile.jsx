import React, { useState, useEffect } from 'react';
import api from '../api';
import PoemCard from '../components/PoemCard';
import './Profile.css';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]); 
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  // const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get(`/profile/${userId}`);
        setUser(userRes.data);
        setEditForm({ name: userRes.data.name, email: userRes.data.email, password: '' });
        const poemsRes = await api.get(`/poems/user/${userId}`);
        setPoems(poemsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/profile/${userId}`, editForm);
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Update failed");
    }
  };

  if (!user) return <div className="content-area">Loading profile...</div>;

  return (
    <div className="content-area">
      <div className="glass profile-card" style={{
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '3rem',
        border: '1px solid var(--primary)',
        background: 'linear-gradient(145deg, rgba(204,164,59,0.05) 0%, rgba(10,10,10,0.8) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h2 className="urdu-font" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Khush-aamdeed, {user.name}</h2>
           {localStorage.getItem('userId') === userId && (<button onClick={() => setIsEditing(!isEditing)} style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
             {isEditing ? 'Cancel' : 'Edit Profile'}
           </button>)}
        </div>

        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email</label>
              <div style={{ fontSize: '1.2rem' }}>{user.email}</div>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Poems Uploaded</label>
              <div style={{ fontSize: '1.2rem' }}>{user._count?.poems || 0}</div>
            </div>
            <div>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password</label>
              <div style={{ fontSize: '1.2rem' }}>••••••••</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
             <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
             <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email" />
             <input value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="New Password (leave blank to keep current)" type="password" />
             <button onClick={handleUpdate} style={{ background: 'var(--primary)', color: '#000', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>Save Changes</button>
          </div>
        )}
      </div>

      <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Your Collection</h3>
      <div>
        {poems.map(poem => <PoemCard key={poem.id} poem={poem} />)}
      </div>
    </div>
  );
};

export default Profile;
