# 🌑 ZEITGEIST INTELLIGENCE

> **Extracting the spirit of the team. Liquidating communication debt.**

ZEITGEIST is a high-fidelity intelligence engine designed to turn chaotic chat logs (Slack, Discord, iMessage) into actionable executive summaries. Built with an Obsidian-grade aesthetic and a zero-retention privacy protocol.

------------------------------------------------------------------------

## ✨ Features

-   **Liquidity Pulse**: Real-time fluid visualization of team communication health.
-   **Neural Analysis**: Powered by Gemini 3 Flash for near-instant signal extraction.
-   **Executive Dashboard**: Secure identity sync via Google to manage credit liquidity.
-   **Zero-Retention**: We process the signal, but we never store the noise. Your logs are never saved.

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   Google Gemini API Key
-   Supabase Project (Database & API)

### Installation

1.  **Clone the repository:**

``` bash
git clone [https://github.com/sabbasov/zeitgeist-intelligence.git](https://github.com/sabbasov/zeitgeist-intelligence.git)
cd zeitgeist-intelligence
```

2.  Install dependencies:

``` bash
npm install
```

3.  Configure Environment: Create a `.env.local` file in the root directory:

``` plaintext
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

4.  Database Setup:

Execute the SQL schema (located in the documentation or Supabase SQL Editor) to initialize the `users`, `purchases`, and `credit_transactions` tables. Ensure Row Level Security (RLS) is configured to allow the frontend to interact with these tables.

5.  Launch Development:

In the root directory:

``` bash
npm run dev
```

The frontend will run on `http://localhost:3000`.

## 🛠️ Tech Stack

-   **Frontend**: React + Vite (TypeScript)
-   **Database**: Supabase (PostgreSQL)
-   **Styling**: Tailwind CSS + Framer Motion (Liquid Shaders)
-   **Intelligence**: Google Gemini 3 Flash
-   **Deployment**: Deployment: Optimized for Vercel

## 🛡️ Privacy Protocol

ZEITGEIST is built on the principle of Ephemeral Intelligence.

-   **In-Memory Processing**: Signal streams are processed in volatile memory and purged instantly upon synthesis.
-   **Stateless Architecture**: No message data ever touches a persistent database.
-   **Metadata Only**: Only high-level account data (credit balance and user ID) is persisted in the Supabase registry.

## 💳 Business Model

-   **Identity Gift**: 25 Credits (Free upon first Sign-In)
-   **Tactical Pack**: \$19 (100 Credits)
-   **Executive Node**: \$49 (500 Credits)

------------------------------------------------------------------------

© 2026 ZEITGEIST LABORATORIES. Built for the era of high-speed communication.