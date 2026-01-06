import React, { useState } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import api from '../api';

const PoemCard = ({ poem }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(poem.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const toggleLike = async () => {
    try {
      const res = await api.post(`/likes/${poem.id}`);
      if (res.data.liked) {
        setLikesCount(prev => prev + 1);
        setLiked(true);
      } else {
        setLikesCount(prev => prev - 1);
        setLiked(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      try {
        const res = await api.get(`/comments/${poem.id}`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(!showComments);
  };

  const postComment = async (e) => {
    if (e.key === 'Enter' && newComment.trim()) {
      try {
        const res = await api.post('/comments', { text: newComment, poemId: poem.id });
        setComments([res.data, ...comments]);
        setNewComment('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="glass" style={{
      marginBottom: '1.5rem',
      padding: '1.5rem',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'transform 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
           <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontFamily: 'Playfair Display' }}>{poem.title}</h3>
           <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>by {poem.author?.name || 'Unknown'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {poem.genres?.map(g => (
            <span key={g.genre.id} style={{
              fontSize: '0.75rem',
              padding: '4px 8px',
              borderRadius: '12px',
              background: 'rgba(204, 164, 59, 0.1)',
              color: 'var(--primary)',
              border: '1px solid rgba(204, 164, 59, 0.2)'
            }}>
              {g.genre.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ 
        whiteSpace: 'pre-wrap', 
        lineHeight: '1.8', 
        color: '#e2e8f0',
        fontFamily: 'Inter, sans-serif'
      }}>
        {poem.content}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginTop: '1rem', 
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <button onClick={toggleLike} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: liked ? 'var(--primary)' : 'var(--text-muted)' }}>
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>
        
        <button onClick={loadComments} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <MessageSquare size={20} />
          <span>{(poem._count?.comments || 0) + comments.length}</span> 
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {comments.map(c => (
              <div key={c.id} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--primary)' }}>{c.user?.name}: </strong>
                {c.text}
              </div>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Write a graceful comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={postComment}
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      )}
    </div>
  );
};

export default PoemCard;
