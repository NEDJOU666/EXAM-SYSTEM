"use client"
import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Check your email for a reset link.');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Forgot Your Password?</h2>
      <p style={styles.subtitle}>Enter your email to reset your password</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Send Reset Link</button>
      </form>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '30px',
    border: '1px solid lightgray',
    borderRadius: '10px',
    backgroundColor: 'white',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    color: 'black',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'dimgray',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid silver',
    borderRadius: '6px',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: 'dodgerblue',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
    marginTop: '15px',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: '15px',
    textAlign: 'center',
  },
};

export default ForgotPassword;
