import React, { useState, useEffect } from 'react';
import api from '../api';
import PoemCard from '../components/PoemCard';
import { RefreshCw } from 'lucide-react';

const Feed = ({ endpoint, title, isRandom }) => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPoems = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      setPoems(res.data);
    } catch (err) {
      console.error("Error fetching poems", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, [endpoint]);

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
          {title}
        </h2>
        {isRandom && (
          <button onClick={fetchPoems} style={{ display: 'flex', gap: '8px', color: 'var(--primary)' }}>
            <RefreshCw size={20} /> Refresh Feed
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
          Loading verses...
        </div>
      ) : (
        <div>
          {poems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
              No poems found here. Be the first to write one!
            </div>
          ) : (
             poems.map(poem => <PoemCard key={poem.id} poem={poem} />)
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
