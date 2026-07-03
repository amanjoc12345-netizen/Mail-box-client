import React from 'react';
import { Card } from 'react-bootstrap';

const Home = () => (
  <Card className="signup-card text-center fade-in">
    <Card.Body>
      <h2 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Home</h2>
      <p className="text-muted">Welcome to the MyWebLink portal. Use the navigation links above or sign up to get started.</p>
    </Card.Body>
  </Card>
);

export default Home;
