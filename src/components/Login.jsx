import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  // Validate form fields are filled (mandatory)
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isFormValid) {
      setError('Both email and password fields are mandatory.');
      return;
    }

    try {
      setLoading(true);
      
      // Perform Firebase Auth sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get Firebase ID Token
      const token = await userCredential.user.getIdToken();
      
      // Store token and email in local storage as requested
      localStorage.setItem('token', token);
      localStorage.setItem('email', userCredential.user.email);

      setSuccess('Logged in successfully! Redirecting...');
      
      // Clear form inputs
      setEmail('');
      setPassword('');

      // Redirect to the Welcome page
      setTimeout(() => {
        navigate('/welcome');
      }, 800);

    } catch (err) {
      console.error("Firebase Login Error:", err);
      let friendlyMessage = 'Failed to sign in. Please verify your credentials.';

      // Handle common credentials errors appropriately
      switch (err.code) {
        case 'auth/invalid-email':
          friendlyMessage = 'The email address is invalid. Please verify and try again.';
          break;
        case 'auth/user-disabled':
          friendlyMessage = 'This account has been disabled. Contact support.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          friendlyMessage = 'Invalid email or password. Please verify your details.';
          break;
        default:
          friendlyMessage = err.message;
      }

      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-100 d-flex flex-column align-items-center justify-content-center fade-in">
      {/* Login Form Card */}
      <Card className="signup-card">
        <Card.Body className="p-0">
          <h2 className="text-center fw-bold mb-4" style={{ color: '#1e293b' }}>
            Login
          </h2>

          {error && (
            <Alert variant="danger" className="py-2 px-3 mb-3 border-0 rounded-3 text-center" style={{ fontSize: '0.9rem' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="py-2 px-3 mb-3 border-0 rounded-3 text-center" style={{ fontSize: '0.9rem' }}>
              {success}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Email Group */}
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label className="form-label-custom">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                className="form-control-custom"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </Form.Group>

            {/* Password Group */}
            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label className="form-label-custom">Password</Form.Label>
              <div className="password-toggle-wrapper">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="form-control-custom pe-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <span 
                  className="password-toggle-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </span>
              </div>
            </Form.Group>

            {/* Submit button disabled unless both fields are filled */}
            <Button 
              type="submit" 
              className="btn-primary-custom" 
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Redirect to SignUp Section */}
      <div className="redirect-card">
        Don't have an account? 
        <Link to="/" className="redirect-link">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
