import React from 'react';
import { Card } from 'react-bootstrap';

const About = () => (
  <Card className="signup-card text-center fade-in">
    <Card.Body>
      <h2 className="fw-bold mb-3" style={{ color: '#1e293b' }}>About Us</h2>
      <p className="text-muted">Learn more about MyWebLink's vision, team, and services.</p>
    </Card.Body>
  </Card>
);

export default About;
