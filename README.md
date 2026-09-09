# Study Group Matcher (MERN)

Matches students into compatible study groups using an explainable rule-based
scoring engine, with group chat, join requests, session scheduling, friends,
and now shared resources (PDF, Word, images, YouTube links).

## Setup

### Backend
```
cd backend
copy .env.example .env
npm install
npm run dev
```

### Frontend
```
cd frontend
copy .env.example .env
npm install
npm run dev
```

Requires MongoDB running locally, or an Atlas URI in `MONGO_URI`.

## New: Resources feature
Inside any group page, you can now:
- Upload a **PDF, Word doc (.doc/.docx), or image** (max 15MB) — stored on the
  backend under `backend/uploads/` and served at `/uploads/<filename>`, openable
  directly in a new tab.
- Add a **YouTube link** with an optional title — validated as a real YouTube
  URL before saving.
- Any group member can view/open resources; only the uploader can remove one.

## Core flow
Register → Profile Setup → Matches (peers/groups with compatibility %) →
create/join a group → group chat, session scheduling, resource sharing →
Friends (send/accept requests) → Profile (editable anytime via nav).
