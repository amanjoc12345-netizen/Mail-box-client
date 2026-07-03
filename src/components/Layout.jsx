import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Adapt layouts depending on whether the user is authenticated in the mailbox app
  const isWelcomePage = location.pathname === '/welcome';

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      navigate('/login');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <>
      {/* Decorative background shapes: ONLY show on login/signup routes */}
      {!isWelcomePage && (
        <>
          <div className="organic-shape-container"></div>
          <div className="bg-organic-blob"></div>
        </>
      )}

      {/* Header Navigation: adapts theme based on route */}
      {isWelcomePage ? (
        <Navbar bg="dark" variant="dark" expand="lg" className="py-2 px-lg-5 px-3 shadow-sm">
          <Container fluid>
            <Navbar.Brand as={Link} to="/welcome" className="fw-bold" style={{ fontSize: '1.35rem' }}>
              MyWebLink
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="welcome-nav" />
            <Navbar.Collapse id="welcome-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/home" className="px-3 text-white-50">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/products" className="px-3 text-white-50">
                  Store
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className="px-3 text-white-50">
                  About
                </Nav.Link>
              </Nav>
              <Nav className="ms-auto">
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                  className="px-4 py-1.5 fw-semibold border-2 btn-sm"
                  style={{ borderRadius: '6px' }}
                >
                  Logout
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      ) : (
        <Navbar expand="lg" className="header-navbar">
          <Container fluid className="px-lg-5 px-3">
            <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
              MyWebLink
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="header-nav" />
            <Navbar.Collapse id="header-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/home" className="nav-link-custom">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/products" className="nav-link-custom">
                  Products
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className="nav-link-custom">
                  About Us
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      {/* Main Content Area */}
      {isWelcomePage ? (
        // Plain full-width white content area for the mailbox dashboard page
        <Container className="py-5" style={{ minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </Container>
      ) : (
        // Centered flex layout for logged-out authentication cards
        <Container className="d-flex flex-column align-items-center justify-content-center py-4" style={{ minHeight: 'calc(100vh - 100px)' }}>
          {children}
        </Container>
      )}
    </>
  );
};

export default Layout;
