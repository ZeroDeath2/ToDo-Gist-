// src/components/Login.js
import { useState } from 'react';
import { supabase } from '../supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = '/';
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else alert('Signup successful! Please log in.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) await handleLogin();
    else await handleSignup();
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Signup'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
      </form>
      <p>
        {isLogin ? 'Don’t have an account?' : 'Already have an account?'}{' '}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Signup' : 'Login'}
        </button>
      </p>
    </div>
  );
}
