import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { FiEdit2, FiInbox, FiSend } from 'react-icons/fi';
import ComposeMail from './ComposeMail';

const Welcome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('welcome');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Row className="gy-4">
      {/* Sidebar Navigation for Mailbox Actions */}
      <Col lg={3} md={4}>
        <div className="mailbox-sidebar shadow-sm">
          <button
            onClick={() => setActiveTab('compose')}
            className={`sidebar-nav-btn mb-4 btn-primary text-white justify-content-center ${activeTab === 'compose' ? 'active' : ''}`}
            style={{ 
              backgroundColor: '#0d6efd', 
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(13, 110, 253, 0.15)'
            }}
          >
            <FiEdit2 className="me-2" size={16} />
            Compose
          </button>
          
          <button
            onClick={() => setActiveTab('inbox')}
            className={`sidebar-nav-btn ${activeTab === 'inbox' ? 'active' : ''}`}
          >
            <FiInbox className="me-2" size={18} />
            Inbox
          </button>
          
          <button
            onClick={() => setActiveTab('sent')}
            className={`sidebar-nav-btn ${activeTab === 'sent' ? 'active' : ''}`}
          >
            <FiSend className="me-2" size={18} />
            Sent
          </button>
        </div>
      </Col>

      {/* Main Mailbox Content Workspace */}
      <Col lg={9} md={8}>
        {activeTab === 'welcome' && (
          <div className="w-100 text-center py-5 fade-in bg-white border border-light rounded-4 shadow-sm" style={{ minHeight: 'calc(100vh - 160px)' }}>
            <div className="py-5">
              <h1 className="fw-bold display-5 mb-3" style={{ color: '#1e293b' }}>
                Welcome to your mail box
              </h1>
              <hr className="my-4 mx-auto" style={{ maxWidth: '500px', borderTop: '2px solid #cbd5e1' }} />
              <p className="text-muted fs-5">
                Manage your messages, write new emails, and keep track of conversations.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'compose' && <ComposeMail />}
        
        {activeTab === 'inbox' && (
          <div className="w-100 text-center py-5 fade-in bg-white border border-light rounded-4 shadow-sm" style={{ minHeight: 'calc(100vh - 160px)' }}>
            <div className="py-5">
              <FiInbox size={48} className="text-muted mb-3" />
              <h3 className="fw-semibold text-secondary">Inbox is Empty</h3>
              <p className="text-muted">You do not have any incoming emails yet.</p>
            </div>
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="w-100 text-center py-5 fade-in bg-white border border-light rounded-4 shadow-sm" style={{ minHeight: 'calc(100vh - 160px)' }}>
            <div className="py-5">
              <FiSend size={48} className="text-muted mb-3" />
              <h3 className="fw-semibold text-secondary">Sentbox is Empty</h3>
              <p className="text-muted">Emails you send will be recorded here.</p>
            </div>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default Welcome;
