import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in both fields.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('Login successful!');
    console.log('Login submitted:', email, password);
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
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="you@example.com"
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder=""
          />
        </div>

        <button type="submit" style={styles.button}>Log In</button>

        {/* Link section below the login button */}
        <div style={styles.linkSection}>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Create Account</Link>
          </p>
          <p>
            <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0px 4px 12px gray',
    width: '100%',
    maxWidth: '400px',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid darkgray',
    marginTop: '5px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'skyblue',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
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
  linkSection: {
    marginTop: '20px',
    fontSize: '14px',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  link: {
    color: 'blue',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

export default LoginPage;
