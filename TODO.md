# TODO - Read/Unread indicators + full message + unread count

## Step 1
- Inspect current inbox/read implementation (already inspected key files).

## Step 2 ✅
- Update `src/store/mail-slice.js`:
  - Ensure fetched inbox mails always have `isRead` boolean (default false).
  - Make `markReadThunk` update Redux state reliably and silently re-fetch inbox after marking read, so dots/count persist correctly across refresh.


## Step 3
- Update `src/components/Inbox.jsx` only if required for correctness (UI already renders dot + full message).

## Step 4
- Run `npm run lint` and verify:
  - blue dot shows only for unread
  - clicking removes dot immediately
  - refresh keeps dots removed
  - left sidebar shows correct unread count

