import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Signup from './components/Signup';
import Home from './components/Home';
import Products from './components/Products';
import About from './components/About';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Root route is the Signup Screen as requested */}
          <Route path="/" element={<Signup />} />
          
          {/* Placeholder routes for links in layout */}
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
