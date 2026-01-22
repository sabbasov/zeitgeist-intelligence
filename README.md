# 🌑 ZEITGEIST INTELLIGENCE

> **Extracting the spirit of the team. Liquidating communication debt.**

ZEITGEIST is a high-fidelity intelligence engine designed to turn chaotic chat logs (Slack, Discord, iMessage) into actionable executive summaries. Built with an Obsidian-grade aesthetic and a zero-retention privacy protocol.

------------------------------------------------------------------------

## ✨ Features

-   **Liquidity Pulse**: Real-time fluid visualization of team communication health.
-   **Action Plans**: AI-driven extraction of high-signal tasks from low-signal noise.
-   **Obsidian UI**: A distraction-free, high-contrast interface designed for focus.
-   **Zero-Retention**: We process the signal, but we never store the noise. Your logs are never saved.

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   Google Gemini API Key (Vertex AI / AI Studio)

### Installation

1.  Clone the repository:

``` bash
git clone https://github.com/sabbasov/zeitgeist-intelligence.git
cd zeitgeist-intelligence
```

2.  Install dependencies:

``` bash
npm install
```

3.  Configure Environment: Create a `.env.local` file in the root directory:

``` plaintext
VITE_GEMINI_API_KEY=your_actual_key_here
VITE_GOOGLE_CLIENT_ID=your_google_id_here
VITE_API_URL=http://localhost:3001/api
```

4.  Set up the Backend API:

``` bash
cd server
npm install
cp env.example .env
# Edit .env and add your DATABASE_URL (see server/README.md for options)
npm run migrate
npm run dev
```

The API server will run on port 3001. Keep it running while developing.

5.  Launch Development:

In the root directory:

``` bash
npm run dev
```

The frontend will run on `http://localhost:3000`. Make sure the backend API is running on port 3001 (see step 4 above).

## 🛠️ Tech Stack

-   **Frontend**: React + Vite (TypeScript)
-   **Backend**: Node.js + Express (TypeScript)
-   **Database**: PostgreSQL (Supabase or self-hosted)
-   **Styling**: Tailwind CSS + Custom Liquid Shaders
-   **Intelligence**: Google Gemini 3 Flash
-   **Infrastructure**: Deployable to any Node.js hosting (Railway, Render, Fly.io, etc.)

## 🛡️ Privacy Protocol

ZEITGEIST is built on the principle of Ephemeral Intelligence.

-   Data is processed in-memory.
-   Logs are purged immediately after analysis.
-   Only high-level metadata (credit balance and user ID) is persisted.

## 💳 Business Model

-   **Trial**: 25 Credits (Free upon first Sign-In)
-   **Starter**: \$19 (100 Credits)
-   **Executive**: \$49 (Unlimited for 30 days)

------------------------------------------------------------------------

© 2026 ZEITGEIST INTELLIGENCE. Built for the era of high-speed communication.