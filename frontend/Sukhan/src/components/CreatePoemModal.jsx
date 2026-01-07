import React, { useState, useEffect } from 'react';
import api from '../api';
import { X } from 'lucide-react';
import './CreatePoemModal.css';

const CreatePoemModal = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    api.get('/genres').then(res => setGenres(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!title || !content) return;
    try {
      await api.post('/poems/create', {
        title,
        content,
        genreIds: selectedGenres
      });
      onCreated();
      onClose();
    } catch (err) {
      alert("Failed to create poem");
    }
  };

  const toggleGenre = (id) => {
    if (selectedGenres.includes(id)) {
      setSelectedGenres(selectedGenres.filter(g => g !== id));
    } else {
      setSelectedGenres([...selectedGenres, id]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass modal-content" onClick={e => e.stopPropagation()} style={{
        width: '600px',
        padding: '2rem',
        borderRadius: '16px',
        background: '#0a0a0a',
        border: '1px solid var(--border-color)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: 'var(--text-muted)' }}>
          <X />
        </button>

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Share Your Sukhan</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            placeholder="Title of your piece" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
          />
          
          <textarea
            placeholder="Pour your heart out..."
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ minHeight: '200px', resize: 'vertical', lineHeight: '1.6' }}
          />

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Select Genres</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {genres.map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGenre(g.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedGenres.includes(g.id) ? 'var(--primary)' : 'var(--border-color)',
                    background: selectedGenres.includes(g.id) ? 'var(--primary)' : 'transparent',
                    color: selectedGenres.includes(g.id) ? 'var(--bg-primary)' : 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSubmit} 
            style={{
              marginTop: '1rem',
              background: 'var(--primary)',
              color: 'var(--bg-primary)',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Publish Poem
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoemModal;
