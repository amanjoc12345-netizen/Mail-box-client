import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Badge } from 'react-bootstrap';
import { FiEdit2, FiInbox, FiSend } from 'react-icons/fi';
import ComposeMail from './ComposeMail';
import Inbox from './Inbox';
import Sentbox from './Sentbox';
import useHttp from '../hooks/use-http';

const Welcome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('welcome');
  
  // State for Inbox and Sentbox emails
  const [inboxEmails, setInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  
  // Ref to hold the latest inboxEmails to prevent closure issues and optimize renders
  const inboxEmailsRef = useRef([]);
  
  // Keep the ref synchronized with the state
  useEffect(() => {
    inboxEmailsRef.current = inboxEmails;
  }, [inboxEmails]);

  // HTTP Custom Hooks for Inbox and Sentbox API calls
  const { isLoading: inboxLoading, error: inboxError, sendRequest: sendInboxRequest } = useHttp();
  const { isLoading: sentLoading, error: sentError, sendRequest: sendSentRequest } = useHttp();
  
  // Unread badge count state
  const [unreadCount, setUnreadCount] = useState(0);

  const sanitizeEmail = (email) => {
    return email.replace(/\./g, '_');
  };

  // Helper to compare two lists of emails to prevent unnecessary state updates
  const isSameEmailList = (listA, listB) => {
    if (listA.length !== listB.length) return false;
    for (let i = 0; i < listA.length; i++) {
      const a = listA[i];
      const b = listB[i];
      if (
        a.id !== b.id ||
        a.isRead !== b.isRead ||
        a.subject !== b.subject ||
        a.body !== b.body ||
        a.timestamp !== b.timestamp ||
        a.sender !== b.sender
      ) {
        return false;
      }
    }
    return true;
  };

  // Fetch received emails from Firebase
  const fetchInboxEmails = useCallback(async (isSilent = false) => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token') || '';
    if (!email) return;

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = "mail-box-client-5c701";
      const inboxUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/inbox.json?auth=${token}`;

      const data = await sendInboxRequest({
        url: inboxUrl,
        silent: isSilent,
        errorMessage: 'Failed to fetch inbox emails.'
      });

      if (!data) {
        if (inboxEmailsRef.current.length > 0) {
          setInboxEmails([]);
          setUnreadCount(0);
        }
        return;
      }

      // Transform object map to array
      const mailsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));

      // Sort by timestamp descending (newest first)
      mailsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Compare fetched list against the current state ref
      if (!isSameEmailList(mailsList, inboxEmailsRef.current)) {
        setInboxEmails(mailsList);
        
        // Compute unread count
        const count = mailsList.filter((m) => !m.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Error fetching inbox:', err);
    }
  }, [sendInboxRequest]);

  // Fetch sent emails from Firebase
  const fetchSentEmails = useCallback(async () => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token') || '';
    if (!email) return;

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = "mail-box-client-5c701";
      const sentUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/sent.json?auth=${token}`;

      const data = await sendSentRequest({
        url: sentUrl,
        errorMessage: 'Failed to fetch sent emails.'
      });

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
    }
  }, [sendSentRequest]);

  // Redirect to login if token is missing, and establish polling for real-time inbox updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Perform initial fetch
    fetchInboxEmails();

    // Start 2-second polling for real-time inbox/unread count updates
    const intervalId = setInterval(() => {
      fetchInboxEmails(true);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [navigate, fetchInboxEmails]);

  // Fetch sent emails whenever user switches to the Sentbox tab
  useEffect(() => {
    if (activeTab === 'sent') {
      fetchSentEmails();
    }
  }, [activeTab, fetchSentEmails]);

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

