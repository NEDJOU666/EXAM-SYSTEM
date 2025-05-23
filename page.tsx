'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        setSuccess('Login successful!');
        console.log('Logged in user:', data.user);
        // Optional: redirect after login
        // window.lo cation.href = '/dashboard';
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.heading}>Login</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Log In</button>

        <div style={styles.links}>
          <p>
            Don’t have an account? <Link href="/signup" style={styles.link}>Create one</Link>
          </p>
          <p>
            <Link href="/forgot-password" style={styles.link}>Forgot password?</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'lightgray',
    color:'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px gray',
    width: '100%',
    maxWidth: '400px',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: 'black',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    borderRadius: '5px',
    border: '1px solid darkgray',
    fontSize: '16px',
    color: 'black',
    backgroundColor: 'white',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'skyblue',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  links: {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px',
  },
  link: {
    color: 'blue',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: '10px',
    textAlign: 'center',
  },
};
