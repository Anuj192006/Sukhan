import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import UserCard from '../components/UserCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [query]);

  return (
    <div className="content-area">
      <h2 style={{ fontSize: '2rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        Poets matching "{query}"
      </h2>
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Searching archives...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No poets found with that name.</div>
      ) : (
        users.map(user => <UserCard key={user.id} user={user} />)
      )}
    </div>
  );
};

export default SearchPage;