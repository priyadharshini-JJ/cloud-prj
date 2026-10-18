# EchoCloud — AI-Powered Personal Knowledge Recovery System

> **Tagline:** Never lose an important piece of information again.

EchoCloud is a full-stack personal knowledge recovery web application built with **React**, **Vite**, **Tailwind CSS**, and **Firebase Modular SDK** (Authentication, Cloud Firestore, Firebase Storage).

---

## 1. System Architecture & Features

### Core Capabilities
- **Authentication**: Email & password signup, signin, logout, password reset with session persistence across page refreshes.
- **Data Isolation**: Every user accesses only their own private knowledge records. Multi-tenant security enforced via Firebase Security Rules.
- **Smart Knowledge Capture**:
  - Title (required)
  - Personal notes & key takeaways
  - Original source URL (Website, YouTube, PDF, Screenshot, Image, Code, Research Paper, Chat, Bookmark, or Other)
  - Category assignment & custom user-defined categories
  - Multi-tag tagging system
  - Star / Favorites toggle
  - Document & image attachments (PDF, PNG, JPG, TXT, DOCX up to 15MB) with real-time upload progress.
- **Knowledge Library**:
  - Responsive cards grid and compact list view
  - Multi-field search across title, notes, source URL, and tags
  - Filter by source type, category, and favorites
  - Sort by newest, oldest, and alphabetical title
  - Pagination for libraries of any size
  - Confirmation dialogs before irreversible item and file deletions.
- **Dedicated Knowledge Recovery Engine**:
  - Fast client-side multi-token search across user records
  - Explanatory match previews showing *why* an item was found (e.g. *Matched in Title*, *Matched in Personal Notes*, *Matched Tag: #react*)
  - Visual keyword match highlighting
  - Live query autocomplete suggestions based on saved metadata
  - Local browser search history with one-click replay and clear options.
- **Category & Tag Taxonomy**:
  - Default domains (Development, Learning, Research, Work, Personal, Ideas)
  - User-created categories with custom color themes and descriptions
  - Dynamic Tag Cloud with frequency counts.
- **Data Privacy & Portability (Settings)**:
  - Display name management & password reset trigger
  - One-click JSON backup export of the user's complete knowledge base
  - Account data purge workflow with confirmation.
- **Zero-Crash Offline / Demo Mode**:
  - The application automatically detects whether real Firebase credentials are configured in `.env`.
  - If keys are not set yet, EchoCloud operates in an isolated LocalStorage preview mode so all features can be evaluated immediately without errors.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, JavaScript (ES modules)
- **Styling**: Tailwind CSS (Emerald SaaS theme)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Backend / BaaS**:
  - Firebase Authentication (Email/Password)
  - Cloud Firestore (Structured documents)
  - Firebase Storage (File attachments)
- **Testing**: Vitest automated unit & logic tests

---

## 3. Data Structure

```text
users/{userId}/
  ├── items/{itemId}
  │     ├── title: string
  │     ├── description: string
  │     ├── sourceUrl: string
  │     ├── sourceType: string
  │     ├── categoryId: string
  │     ├── categoryName: string
  │     ├── tags: string[]
  │     ├── isFavorite: boolean
  │     ├── attachment: {
  │     │     storagePath: string,
  │     │     downloadUrl: string,
  │     │     fileName: string,
  │     │     mimeType: string,
  │     │     fileSize: number,
  │     │     uploadedAt: string
  │     │   }
  │     ├── userId: string
  │     ├── createdAt: timestamp
  │     └── updatedAt: timestamp
  │
  ├── categories/{categoryId}
  │     ├── name: string
  │     ├── color: string
  │     ├── description: string
  │     └── userId: string
  │
  └── settings/profile
```

---

## 4. Setup & Running Locally

### Step 1: Clone or navigate to the workspace
```bash
cd "c:\Users\dhars\cloud prj"
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the template to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```
*(If you run the app without `.env`, EchoCloud will start in Guest/Preview Mode automatically).*

### Step 4: Start the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 5: Run Automated Tests
```bash
npm test
```

---

## 5. Step-by-Step Firebase Console Guide

Follow these steps to connect your own live Firebase project:

1. **Create Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Click **Add project**, name it `echocloud-recovery` (or your choice), and disable Google Analytics for simplicity.
   - Click **Create project**.

2. **Register Web App**:
   - On the project overview page, click the **Web icon** (`</>`).
   - App nickname: `EchoCloud Web`.
   - Click **Register app**.
   - Copy the `firebaseConfig` keys into your `.env` file according to `.env.example`.

3. **Enable Firebase Authentication**:
   - In the left sidebar, click **Build** -> **Authentication**.
   - Click **Get started**.
   - Under the **Sign-in method** tab, click **Email/Password**.
   - Enable the first switch (**Email/Password**) and click **Save**.

4. **Enable Cloud Firestore**:
   - In the left sidebar, click **Build** -> **Firestore Database**.
   - Click **Create database**.
   - Choose a location near your users (e.g. `us-central1` or `asia-south1`).
   - Choose **Start in production mode**.
   - Go to the **Rules** tab, paste the contents of `firestore.rules` from this repository, and click **Publish**.

5. **Enable Firebase Storage**:
   - In the left sidebar, click **Build** -> **Storage**.
   - Click **Get started**.
   - Choose **Start in production mode** and accept the bucket location.
   - Go to the **Rules** tab, paste the contents of `storage.rules`, and click **Publish**.
   - *Note on Storage*: Firebase Storage provides 5GB free tier on the Spark plan. No credit card is required.

---

## 6. Troubleshooting Guide

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| **"Offline / Demo Mode" pill in sidebar** | `.env` file is missing or has placeholder keys. | Create `.env` and paste your real `VITE_FIREBASE_*` values from Project Settings, then restart `npm run dev`. |
| **`auth/email-already-in-use`** | An account with this email exists. | Switch to the "Sign In" tab or use "Reset Password". |
| **`permission-denied` on Firestore save** | Firestore rules are not published or user is unauthenticated. | Ensure `firestore.rules` is published in the Firebase Console. |
| **Storage upload fails with CORS** | Localhost is blocked by Google Cloud storage bucket CORS. | Run `gsutil cors set cors.json gs://<bucket-name>` or use the default Firebase storage URL format. |
| **File rejected (> 15 MB)** | Upload exceeds safety limits. | Ensure uploaded images/PDFs are under 15 MB as configured in `src/lib/storageService.js` and `storage.rules`. |
