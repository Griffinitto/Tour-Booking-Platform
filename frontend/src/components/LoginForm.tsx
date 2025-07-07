import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginUser } from '../services/api';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if using mock auth mode
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        await loginUser(email, password);
        window.location.href = '/tours';
        return;
      }

      // Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by the auth state change in App.tsx
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
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
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      {process.env.REACT_APP_USE_MOCK_AUTH === 'true' && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          Demo credentials: test@example.com / password
        </div>
      )}
    </form>
  );
};

export default LoginForm;