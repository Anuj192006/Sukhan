import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.post('/login', { email: form.email, password: form.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId);
        navigate('/');
      } else {
        await api.post('/signup', form);
        alert("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert("Authentication failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #1e293b 0%, #000000 100%)'
    }}>
      <div className="glass auth-card" style={{ width: '400px', padding: '2.5rem', borderRadius: '16px', textAlign: 'center' }}>
        <h1 className="urdu-font" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Sukhan</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Where words find their soul.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input 
              placeholder="Your Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
          )}
          <input 
            placeholder="Email Address" 
            type="email"
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            required
          />
          <input 
            placeholder="Password" 
            type="password"
            value={form.password} 
            onChange={e => setForm({...form, password: e.target.value})} 
            required
          />

          <button type="submit" style={{ 
            background: 'var(--primary)', 
            color: 'var(--bg-primary)', 
            padding: '12px', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            marginTop: '1rem',
            fontSize: '1rem'
          }}>
            {isLogin ? 'Enter' : 'Join Sukhan'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isLogin ? "New here? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            {isLogin ? "Create Account" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
