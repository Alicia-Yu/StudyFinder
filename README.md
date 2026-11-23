# ⚔️ ConQuest (StudyFinder)

**A gamified study app that turns campus study spots into territories to conquer, with an AI assistant that helps students find where to study.**

Built for a hackathon at the University of Washington.

<!-- Add a screenshot or GIF of the map and AI chat here, e.g.: ![ConQuest map and AI chat](docs/screenshot.png) -->

**Demo video:** [link here]

---

## What it does

- 🗺️ **Interactive map** of UW-area libraries, cafes and study spots, with live location tracking
- ⏱️ **Study sessions:** time spent at a location counts toward "conquering" it
- 🏆 **Levels, achievements and a leaderboard** to keep studying motivating
- 👥 **Friends system** to see where friends are studying
- 🤖 **AI features** (see below)

---

## AI features

### AI chat assistant (Groq)
A built-in chat assistant helps students find study spots and cafes near campus.

- The browser sends messages to the app's own Express server (`POST /api/ai/chat`).
- The server adds a system prompt (UW, Seattle, study spots), calls Groq's OpenAI-compatible API with the `openai/gpt-oss-20b` model, and returns the reply.
- The API key lives only in the server's environment variables, so it is never exposed to the browser.

### Personalized insights and recommendations (Gemini)
Server routes call the Google Gemini API with a signed-in user's own study data:

- `POST /api/ai/insights`: turns time spent, favorite spots and visit patterns into personalized insights
- `POST /api/ai/recommendations`: suggests new study spots based on location history
- `POST /api/ai/description`: generates descriptions for study locations

Prompts ask Gemini for **structured JSON** so the app can display results directly, and each route has **fallback responses** if the AI service is unavailable.

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Leaflet / React-Leaflet, Axios |
| Backend | Node.js, Express |
| Database & auth | Supabase (PostgreSQL + Auth) |
| AI | Groq API (`gpt-oss-20b`), Google Gemini API |

---

## Getting started

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Add environment variables

Create `server/.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
PORT=3001
```

Create `client/.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3001/api
```

`.env` files are git-ignored. Never commit API keys.

### 3. Run the app
```bash
npm run dev
```
This starts the Express server (port 3001) and the Vite frontend (usually http://localhost:5173).

---

## Project structure

```
client/          React frontend
  src/components/  Map, AI chat and UI components
  src/pages/       Dashboard, Leaderboard, Collections, Settings
  src/services/    API and AI service calls
server/          Express backend
  server.js        API routes, including /api/ai/*
  services/        Supabase auth and location services
database/        Database setup scripts
```

1. Check the console for errors
2. Verify environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Check that all dependencies are installed

For more help, please open an issue in the repository.
