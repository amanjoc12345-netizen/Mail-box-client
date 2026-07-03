import React, { useState } from 'react';
import { Row, Col, Card, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { FiSearch, FiRotateCw, FiTrash2, FiInbox, FiEdit2, FiClock, FiUser } from 'react-icons/fi';

const Inbox = ({ emails = [], loading = false, error = '', onRefresh, onCompose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMailId, setSelectedMailId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sanitizes user email to match firebase key path rules
  const sanitizeEmail = (email) => {
    return email.replace(/\./g, '_');
  };

  // Strips HTML tags to generate a plain-text preview of the body
  const stripHtml = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Helper to format Date cleanly
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      
      // If it's today, show only time. Otherwise, show date and time.
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  // Handle selecting an email, and mark it as read in Firebase if unread
  const handleSelectMail = async (mail) => {
    setSelectedMailId(mail.id);
    
    if (!mail.isRead) {
      try {
        const userEmail = localStorage.getItem('email') || 'unknown@example.com';
        const token = localStorage.getItem('token') || '';
        const sanitizedUser = sanitizeEmail(userEmail);
        const projectId = "mail-box-client-5c701";
        const mailUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/inbox/${mail.id}.json?auth=${token}`;

        // Mark as read in the database
        await fetch(mailUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true })
        });

        // Trigger parent state update
        if (onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error('Error marking email as read:', err);
      }
    }
  };

  // Handle deleting an email from Firebase
  const handleDeleteMail = async (mailId) => {
    if (!window.confirm('Are you sure you want to permanently delete this email?')) {
      return;
    }

    setDeleting(true);
    try {
      const userEmail = localStorage.getItem('email') || 'unknown@example.com';
      const token = localStorage.getItem('token') || '';
      const sanitizedUser = sanitizeEmail(userEmail);
      const projectId = "mail-box-client-5c701";
      const mailUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/inbox/${mailId}.json?auth=${token}`;

      const response = await fetch(mailUrl, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete email from database.');
      }

      setSelectedMailId(null);
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Error deleting email:', err);
      alert(err.message || 'An error occurred during deletion.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter emails based on the search query
  const filteredEmails = emails.filter((mail) => {
    const term = searchTerm.toLowerCase();
    const bodyText = stripHtml(mail.body || '').toLowerCase();
    const sender = (mail.sender || '').toLowerCase();
    const subject = (mail.subject || '').toLowerCase();
    return sender.includes(term) || subject.includes(term) || bodyText.includes(term);
  });

  // Find currently selected mail object
  const selectedMail = emails.find((m) => m.id === selectedMailId);

  return (
    <div className="w-100 fade-in">
      {/* Header bar with search and control options */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
          <InputGroup className="shadow-sm border-0 rounded-3 overflow-hidden">
            <InputGroup.Text className="bg-white border-0 pe-1">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by sender, subject, or content..."
              className="border-0 bg-white ps-2 py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.95rem', boxShadow: 'none' }}
            />
          </InputGroup>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <Button 
            variant="outline-secondary" 
            className="d-flex align-items-center justify-content-center p-2.5 rounded-3 bg-white shadow-sm border-light hover-shadow"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Inbox"
            style={{ transition: 'all 0.2s' }}
          >
            <FiRotateCw size={18} className={loading ? 'spin-animation' : ''} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 rounded-3 shadow-sm py-2 px-3 mb-4 text-center">
          {error}
        </div>
      )}

      {emails.length === 0 && !loading ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
          <Card.Body className="py-5">
            <FiInbox size={56} className="text-muted mb-3" style={{ opacity: 0.6 }} />
            <h3 className="fw-bold mb-2" style={{ color: '#1e293b' }}>Your Inbox is Empty</h3>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '380px' }}>
              You don't have any incoming messages at the moment.
            </p>
            <Button
              className="btn-primary-custom px-4 py-2 mt-0 w-auto"
              onClick={onCompose}
            >
              <FiEdit2 className="me-2" /> Compose Mail
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {/* Left Column: Email list */}
          <Col lg={5}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ minHeight: '500px' }}>
              <div className="card-header bg-white border-0 py-3 px-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                    Messages
                  </h5>
                  <Badge bg="primary" pill className="px-2.5 py-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {emails.filter(e => !e.isRead).length} Unread
                  </Badge>
                </div>
              </div>
              <div className="overflow-auto mail-list-container" style={{ maxHeight: '600px' }}>
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    No messages match your search.
                  </div>
                ) : (
                  filteredEmails.map((mail) => (
                    <div
                      key={mail.id}
                      onClick={() => handleSelectMail(mail)}
                      className={`p-3 border-bottom mail-list-item position-relative d-flex align-items-start gap-3 cursor-pointer ${
                        selectedMailId === mail.id ? 'mail-item-active' : ''
                      } ${!mail.isRead ? 'mail-item-unread' : ''}`}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderLeft: selectedMailId === mail.id ? '4px solid #0d6efd' : '4px solid transparent'
                      }}
                    >
                      {/* Unread Indicator Dot */}
                      {!mail.isRead && (
                        <span 
                          className="position-absolute top-50 translate-y-middle rounded-circle bg-primary" 
                          style={{ width: '8px', height: '8px', left: '10px' }}
                        />
                      )}
                      
                      {/* Sender Avatar Initials */}
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: !mail.isRead ? '#e0f2fe' : '#f1f5f9',
                          color: !mail.isRead ? '#0369a1' : '#64748b',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          marginLeft: !mail.isRead ? '8px' : '0'
                        }}
                      >
                        {mail.sender ? mail.sender.charAt(0).toUpperCase() : '?'}
                      </div>

                      {/* Content block */}
                      <div className="flex-grow-1 overflow-hidden" style={{ marginLeft: !mail.isRead && selectedMailId !== mail.id ? '0' : '0' }}>
                        <div className="d-flex justify-content-between align-items-baseline mb-1">
                          <span 
                            className={`text-truncate fs-6 ${!mail.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}
                            style={{ maxWidth: '160px', display: 'inline-block' }}
                          >
                            {mail.sender}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {formatDate(mail.timestamp)}
                          </span>
                        </div>
                        <h6 className={`text-truncate mb-1 ${!mail.isRead ? 'fw-bold text-dark' : 'text-secondary'}`} style={{ fontSize: '0.9rem' }}>
                          {mail.subject || '(No Subject)'}
                        </h6>
                        <p className="text-muted text-truncate mb-0" style={{ fontSize: '0.85rem' }}>
                          {stripHtml(mail.body || '')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Col>

          {/* Right Column: Detailed Pane */}
          <Col lg={7}>
            {selectedMail ? (
              <Card className="border-0 shadow-sm rounded-4 h-100 d-flex flex-column" style={{ minHeight: '500px' }}>
                <Card.Header className="bg-white border-0 pt-4 px-4 pb-3">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="overflow-hidden">
                      <h4 className="fw-bold mb-2 text-dark" style={{ wordBreak: 'break-word', lineHeight: 1.3 }}>
                        {selectedMail.subject || '(No Subject)'}
                      </h4>
                      <div className="d-flex align-items-center mt-3 gap-2">
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                          <FiUser className="text-secondary" />
                        </div>
                        <div>
                          <div className="fw-semibold text-secondary" style={{ fontSize: '0.9rem' }}>
                            From: <span className="text-dark">{selectedMail.sender}</span>
                          </div>
                          <div className="text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.8rem' }}>
                            <FiClock size={12} />
                            <span>{formatDate(selectedMail.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteMail(selectedMail.id)}
                      disabled={deleting}
                      className="d-flex align-items-center gap-1.5 px-3 py-2 border-light shadow-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      {deleting ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <FiTrash2 /> <span className="d-none d-sm-inline">Delete</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Header>
                
                <hr className="my-0 mx-4" style={{ borderColor: '#f1f5f9' }} />

                <Card.Body className="p-4 flex-grow-1 overflow-auto bg-white rounded-bottom-4">
                  {/* Email body rendering HTML content safely */}
                  <div 
                    className="mail-body-content"
                    dangerouslySetInnerHTML={{ __html: selectedMail.body }} 
                    style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#334155' }}
                  />
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm rounded-4 h-100 d-flex align-items-center justify-content-center text-center py-5" style={{ minHeight: '500px' }}>
                <Card.Body className="py-5 d-flex flex-column align-items-center justify-content-center">
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '70px', height: '70px' }}
                  >
                    <FiInbox className="text-muted" size={32} />
                  </div>
                  <h5 className="fw-semibold text-secondary">No Message Selected</h5>
                  <p className="text-muted px-4" style={{ maxWidth: '300px' }}>
                    Choose an email from the messages panel to view its complete content.
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Inbox;
