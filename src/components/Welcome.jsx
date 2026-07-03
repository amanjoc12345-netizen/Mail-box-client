import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="w-100 text-center py-5 fade-in">
      <h1 className="fw-bold display-5 mb-3" style={{ color: '#1e293b' }}>
        Welcome to your mail box
      </h1>
      <hr className="my-4 mx-auto" style={{ maxWidth: '600px', borderTop: '2px solid #cbd5e1' }} />
    </div>
  );
};

export default Welcome;
