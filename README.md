# Auto-Draft AI

An AI agent that learns your email style and drafts replies for you.

## Setup

1. **Install Node.js** (if not already installed).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your Google Cloud Credentials.
   - You must enable the **Gmail API** in Google Cloud Console.
   - Add `http://localhost:3000/api/auth/callback` to your Authorized Redirect URIs.

## Usage

1. Run the development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000`.
3. Click **Connect Gmail** to authenticate.
4. Click **Run Auto-Draft** to analyze your email history and generate drafts for unread messages.

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **SQLite** (better-sqlite3)
- **Googleapis** (Gmail)
