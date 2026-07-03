import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Badge } from 'react-bootstrap';
import { FiEdit2, FiInbox, FiSend } from 'react-icons/fi';
import ComposeMail from './ComposeMail';
import Inbox from './Inbox';
import Sentbox from './Sentbox';

const Welcome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('welcome');
  
  // State for Inbox and Sentbox emails
  const [inboxEmails, setInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  
  // Loading and Error states
  const [inboxLoading, setInboxLoading] = useState(false);
  const [sentLoading, setSentLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [sentError, setSentError] = useState('');
  
  // Unread badge count state
  const [unreadCount, setUnreadCount] = useState(0);

  const sanitizeEmail = (email) => {
    return email.replace(/\./g, '_');
  };

  // Fetch received emails from Firebase
  const fetchInboxEmails = async (isSilent = false) => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token') || '';
    if (!email) return;

    if (!isSilent) setInboxLoading(true);
    setInboxError('');

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = "mail-box-client-5c701";
      const inboxUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/inbox.json?auth=${token}`;

      const response = await fetch(inboxUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch inbox emails.');
      }
      
      const data = await response.json();
      if (!data) {
        setInboxEmails([]);
        setUnreadCount(0);
        return;
      }

      // Transform object map to array
      const mailsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));

      // Sort by timestamp descending (newest first)
      mailsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setInboxEmails(mailsList);

      // Compute unread count
      const count = mailsList.filter((m) => !m.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching inbox:', err);
      setInboxError(err.message || 'An error occurred while loading inbox.');
    } finally {
      if (!isSilent) setInboxLoading(false);
    }
  };

  // Fetch sent emails from Firebase
  const fetchSentEmails = async () => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token') || '';
    if (!email) return;

    setSentLoading(true);
    setSentError('');

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = "mail-box-client-5c701";
      const sentUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/sent.json?auth=${token}`;

      const response = await fetch(sentUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch sent emails.');
      }
      
      const data = await response.json();
      if (!data) {
        setSentEmails([]);
        return;
      }

      // Transform object map to array
      const mailsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));

      // Sort by timestamp descending
      mailsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setSentEmails(mailsList);
    } catch (err) {
      console.error('Error fetching sentbox:', err);
      setSentError(err.message || 'An error occurred while loading sent emails.');
    } finally {
      setSentLoading(false);
    }
  };

  // Redirect to login if token is missing, and establish polling for real-time inbox updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Perform initial fetch
    fetchInboxEmails();

    // Start 10-second polling for real-time inbox/unread count updates
    const intervalId = setInterval(() => {
      fetchInboxEmails(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  // Fetch sent emails whenever user switches to the Sentbox tab
  useEffect(() => {
    if (activeTab === 'sent') {
      fetchSentEmails();
    }
  }, [activeTab]);

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
            <span>Inbox</span>
            {unreadCount > 0 && (
              <Badge bg="primary" pill className="ms-auto font-weight-bold" style={{ fontSize: '0.75rem' }}>
                {unreadCount}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('sent')}
            className={`sidebar-nav-btn ${activeTab === 'sent' ? 'active' : ''}`}
          >
            <FiSend className="me-2" size={18} />
            <span>Sent</span>
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
          <Inbox 
            emails={inboxEmails} 
            loading={inboxLoading} 
            error={inboxError} 
            onRefresh={fetchInboxEmails} 
            onCompose={() => setActiveTab('compose')} 
          />
        )}

        {activeTab === 'sent' && (
          <Sentbox 
            emails={sentEmails} 
            loading={sentLoading} 
            error={sentError} 
            onRefresh={fetchSentEmails} 
            onCompose={() => setActiveTab('compose')} 
          />
        )}
      </Col>
    </Row>
  );
};

export default Welcome;

