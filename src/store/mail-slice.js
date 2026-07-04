import { createSlice } from '@reduxjs/toolkit';

const mailSlice = createSlice({
  name: 'mail',
  initialState: {
    inboxEmails: [],
    sentEmails: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setInbox(state, action) {
      state.inboxEmails = action.payload;
      state.unreadCount = action.payload.filter((mail) => !mail.isRead).length;
    },
    setSent(state, action) {
      state.sentEmails = action.payload;
    },
    markAsRead(state, action) {
      const mailId = action.payload;
      const existingMail = state.inboxEmails.find((mail) => mail.id === mailId);
      if (existingMail && !existingMail.isRead) {
        existingMail.isRead = true;
        state.unreadCount = state.inboxEmails.filter((mail) => !mail.isRead).length;
      }
    },
    deleteInboxMail(state, action) {
      const mailId = action.payload;
      state.inboxEmails = state.inboxEmails.filter((mail) => mail.id !== mailId);
      state.unreadCount = state.inboxEmails.filter((mail) => !mail.isRead).length;
    },
    deleteSentMail(state, action) {
      const mailId = action.payload;
      state.sentEmails = state.sentEmails.filter((mail) => mail.id !== mailId);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const mailActions = mailSlice.actions;

// Async Thunks for Firebase Operations

// Sanitizes email addresses for Firebase keys
const sanitizeEmail = (email) => {
  // Normalize consistently across fetch + write to avoid case/whitespace mismatches in Firebase keys
  return email.trim().toLowerCase().replace(/\./g, '_');
};

// 1. Fetch received emails (Inbox)
export const fetchInboxThunk = (email, token, isSilent = false) => {
  return async (dispatch) => {
    if (!email) return;
    if (!isSilent) dispatch(mailActions.setLoading(true));
    dispatch(mailActions.setError(null));

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = 'mail-box-client-5c701';
      const inboxUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/inbox.json?auth=${token}`;

      const response = await fetch(inboxUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch inbox emails.');
      }

      const data = await response.json();
      if (!data) {
        dispatch(mailActions.setInbox([]));
        return;
      }

      // Convert database object map to sorted array
      const mailsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
        // Ensure isRead is always a boolean so UI/dots are consistent
        isRead: typeof data[key]?.isRead === 'boolean' ? data[key].isRead : false,
      }));
      mailsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      dispatch(mailActions.setInbox(mailsList));
    } catch (err) {
      console.error('Error fetching inbox:', err);
      dispatch(mailActions.setError(err.message || 'An error occurred while loading inbox.'));
    } finally {
      if (!isSilent) dispatch(mailActions.setLoading(false));
    }
  };
};

// 2. Fetch sent emails (Sentbox)
export const fetchSentThunk = (email, token) => {
  return async (dispatch) => {
    if (!email) return;
    dispatch(mailActions.setLoading(true));
    dispatch(mailActions.setError(null));

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = 'mail-box-client-5c701';
      const sentUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/sent.json?auth=${token}`;

      const response = await fetch(sentUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch sent emails.');
      }

      const data = await response.json();
      if (!data) {
        dispatch(mailActions.setSent([]));
        return;
      }

      // Convert database object map to sorted array
      const mailsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      mailsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      dispatch(mailActions.setSent(mailsList));
    } catch (err) {
      console.error('Error fetching sentbox:', err);
      dispatch(mailActions.setError(err.message || 'An error occurred while loading sent emails.'));
    } finally {
      dispatch(mailActions.setLoading(false));
    }
  };
};

// 3. Mark an email as read
export const markReadThunk = (mailId, email, token) => {
  return async (dispatch, getState) => {
    if (!email || !mailId) return;

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = 'mail-box-client-5c701';
      const mailUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/inbox/${mailId}.json?auth=${token}`;

      // 1) Update in Firebase database
      const response = await fetch(mailUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) return;

      // 2) Update local Redux store state deterministically
      //    (use state instead of assuming mail is currently present)
      const state = getState();
      const existing = state.mail.inboxEmails.find((m) => m.id === mailId);
      if (existing && !existing.isRead) {
        dispatch(mailActions.markAsRead(mailId));
      } else {
        // Still recompute unreadCount to be safe
        dispatch(mailActions.setInbox(state.mail.inboxEmails));
      }

      // 3) Fetch inbox silently so UI reflects Firebase even if local cache is stale
      //    (this also fixes refresh/persistence correctness)
      const inboxUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/inbox.json?auth=${token}`;
      const inboxRes = await fetch(inboxUrl);
      if (!inboxRes.ok) return;

      const data = await inboxRes.json();
      if (!data) {
        dispatch(mailActions.setInbox([]));
        return;
      }

      const mailsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
        isRead: typeof data[key]?.isRead === 'boolean' ? data[key].isRead : false,
      }));
      mailsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      dispatch(mailActions.setInbox(mailsList));
    } catch (err) {
      console.error('Error marking email as read in database:', err);
    }
  };
};

// 4. Delete an email
export const deleteMailThunk = (mailId, boxType, email, token) => {
  return async (dispatch) => {
    if (!email || !mailId) return;
    dispatch(mailActions.setLoading(true));

    try {
      const sanitizedUser = sanitizeEmail(email);
      const projectId = 'mail-box-client-5c701';
      const folder = boxType === 'inbox' ? 'inbox' : 'sent';
      const mailUrl = `https://${projectId}-default-rtdb.firebaseio.com/emails/${sanitizedUser}/${folder}/${mailId}.json?auth=${token}`;

      const response = await fetch(mailUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email from database.');
      }

      // Update local Redux store state
      if (boxType === 'inbox') {
        dispatch(mailActions.deleteInboxMail(mailId));
      } else {
        dispatch(mailActions.deleteSentMail(mailId));
      }
    } catch (err) {
      console.error('Error deleting email:', err);
      dispatch(mailActions.setError(err.message || 'An error occurred during deletion.'));
      throw err; // Propagate error to components
    } finally {
      dispatch(mailActions.setLoading(false));
    }
  };
};

export default mailSlice.reducer;
