import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <>
      {/* Decorative background shapes */}
      <div className="organic-shape-container"></div>
      <div className="bg-organic-blob"></div>

      {/* Header Navigation matching design exactly */}
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

      {/* Main Content Area: centered layout for the signup card */}
      <Container className="d-flex flex-column align-items-center justify-content-center py-4" style={{ minHeight: 'calc(100vh - 100px)' }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;
