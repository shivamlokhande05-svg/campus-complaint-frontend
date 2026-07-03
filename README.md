# Campus Fix — Frontend

React app for the Smart Campus Complaint System. Connects to your existing backend running on `http://localhost:5000`.

## Setup

1. **Backend should already be running** in a separate terminal (`npm run dev` in the backend folder) — this app needs it.

2. Install dependencies:
   ```
   npm install
   ```

3. Start the app:
   ```
   npm run dev
   ```

4. Open the URL shown in the terminal — usually **http://localhost:3000**

## What's inside

- `/login` and `/signup` — auth pages, role toggle (Student / Warden-Admin) on signup
- `/dashboard` — student view: file a new complaint, see status of your own complaints
- `/admin` — admin view: see every complaint, filter by status, move complaints through Pending → In Progress → Resolved

## If something doesn't connect

- Make sure the backend terminal still shows "Server running on port 5000" and "MongoDB connected successfully"
- If your backend runs on a different port, update `API_BASE_URL` in `src/api.js`
