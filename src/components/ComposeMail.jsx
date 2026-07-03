import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import RichTextEditor from './RichTextEditor';

const ComposeMail = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sanitizes email addresses for Firebase key compatibility (replaces dots . with underscores _)
  const sanitizeEmail = (email) => {
    return email.replace(/\./g, '_');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Pre-submission validation
    if (!to.trim()) {
      setError('Recipient email (To) is mandatory.');
      return;
    }

    // Strip HTML to check if there is actual text content inside the body
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = body;
    const plainTextContent = (tempDiv.textContent || tempDiv.innerText || '').trim();

    if (!plainTextContent) {
      setError('Email body cannot be empty.');
      return;
    }

    // Retrieve sender email from local storage
    const senderEmail = localStorage.getItem('email') || 'unknown@example.com';

    const mailData = {
      sender: senderEmail,
      receiver: to.trim(),
      subject: subject.trim() || '(No Subject)',
      body: body, // HTML string from rich text editor
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setLoading(true);

    try {
      const sanitizedReceiver = sanitizeEmail(to.trim());
      const sanitizedSender = sanitizeEmail(senderEmail);
      const token = localStorage.getItem('token') || '';

      // Construct Realtime Database REST API endpoints using user's Project ID
      const projectId = "mail-box-client-5c701";
      const databaseUrl = `https://${projectId}-default-rtdb.firebaseio.com`;

      // 1. Send / Post to receiver's inbox
      const inboxUrl = `${databaseUrl}/emails/${sanitizedReceiver}/inbox.json?auth=${token}`;
      const inboxRes = await fetch(inboxUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mailData)
      });

      if (!inboxRes.ok) {
        throw new Error('Failed to deliver email to recipient inbox.');
      }

      // 2. Send / Post to sender's sentbox
      const sentUrl = `${databaseUrl}/emails/${sanitizedSender}/sent.json?auth=${token}`;
      const sentRes = await fetch(sentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mailData)
      });

      if (!sentRes.ok) {
        throw new Error('Failed to record email in your sentbox.');
      }

      setSuccess('Email sent successfully!');
      
      // Reset input fields
      setTo('');
      setSubject('');
      setBody('');

    } catch (err) {
      console.error('Failed to send mail:', err);
      setError(err.message || 'An error occurred while sending the email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 w-100 fade-in">
      <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
        <h4 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
          Compose Mail
        </h4>
      </Card.Header>
      
      <Card.Body className="px-4 pb-4 pt-2">
        {error && (
          <Alert variant="danger" className="py-2 px-3 mb-3 border-0 rounded-3 text-center" style={{ fontSize: '0.9rem' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="py-2 px-3 mb-3 border-0 rounded-3 text-center" style={{ fontSize: '0.9rem' }}>
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSend}>
          {/* Recipient To */}
          <Form.Group className="mb-3" controlId="mail-to">
            <Form.Label className="form-label-custom">To</Form.Label>
            <Form.Control
              type="email"
              placeholder="recipient@example.com"
              className="form-control-custom"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>

          {/* Subject */}
          <Form.Group className="mb-3" controlId="mail-subject">
            <Form.Label className="form-label-custom">Subject</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject"
              className="form-control-custom"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          {/* Rich Text Editor */}
          <Form.Group className="mb-4" controlId="mail-body">
            <Form.Label className="form-label-custom">Message</Form.Label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Type your message here..."
            />
          </Form.Group>

          {/* Actions */}
          <div className="d-flex justify-content-end gap-2">
            <Button
              type="submit"
              className="btn-primary-custom px-5 py-2.5 mt-0 w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ComposeMail;
