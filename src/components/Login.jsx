import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="w-100 d-flex flex-column align-items-center justify-content-center fade-in">
      <Card className="signup-card">
        <Card.Body className="p-0">
          <h2 className="text-center fw-bold mb-4" style={{ color: '#1e293b' }}>
            Login
          </h2>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label className="form-label-custom">Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter email" 
                className="form-control-custom" 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label className="form-label-custom">Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Password" 
                className="form-control-custom" 
                required 
              />
            </Form.Group>
            <Button type="submit" className="btn-primary-custom">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="redirect-card">
        Don't have an account? 
        <Link to="/" className="redirect-link">
          SignUp
        </Link>
      </div>
    </div>
  );
};

export default Login;
