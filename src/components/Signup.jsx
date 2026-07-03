import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if form is fully filled out (all fields mandatory)
  const isFormValid = email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');

    // Extra double checks for form submission state
    if (!isFormValid) {
      setError('All fields are mandatory. Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      
      // Call Google Firebase Authentication to create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // On success, print to console as requested
      console.log("User has successfully signed up.");
      
      setSuccess("User has successfully signed up.");
      
      // Reset inputs
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Firebase Auth Error: ", err);
      let friendlyMessage = 'An error occurred during registration. Please try again.';
      
      // Translate firebase error codes to user-friendly notifications
      switch (err.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = 'This email is already in use. Please log in or use a different email.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'The email address is invalid. Please verify and try again.';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'The password is too weak. It must be at least 6 characters long.';
          break;
        case 'auth/operation-not-allowed':
          friendlyMessage = 'Email & password signups are disabled in Firebase. Please enable them in console.';
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
      {/* Main Signup Form Card */}
      <Card className="signup-card">
        <Card.Body className="p-0">
          <h2 className="text-center fw-bold mb-4" style={{ color: '#1e293b' }}>
            SignUp
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
            {/* Email Input */}
            <Form.Group className="mb-3" controlId="signup-email">
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

            {/* Password Input */}
            <Form.Group className="mb-3" controlId="signup-password">
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

            {/* Confirm Password Input */}
            <Form.Group className="mb-4" controlId="signup-confirm-password">
              <Form.Label className="form-label-custom">Confirm Password</Form.Label>
              <div className="password-toggle-wrapper">
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="form-control-custom pe-5"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <span 
                  className="password-toggle-icon" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </span>
              </div>
            </Form.Group>

            {/* Submit Button - disabled until all fields are filled */}
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
                  Signing up...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Redirect Card Directly Below */}
      <div className="redirect-card">
        Have an account? 
        <Link to="/login" className="redirect-link">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Signup;
