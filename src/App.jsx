import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Signup from './components/Signup';
import Home from './components/Home';
import Products from './components/Products';
import About from './components/About';
import Login from './components/Login';
import Welcome from './components/Welcome';

// Route Guard: Redirects to /login if there's no authenticated token
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Route Guard: Redirects to /welcome if the user is already authenticated (prevents accessing login/signup)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/welcome" replace /> : children;
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          
          {/* Protected Main Dashboard */}
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          
          {/* Static informational pages */}
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
