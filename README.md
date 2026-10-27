# UnityChurch

Public backup of the UnityChurch Base44 web app (church community: announcements, events, departments, giving, members, news).

## Stack
- Vite + React
- Base44 backend (entities under `base44/entities/`, functions under `base44/functions/`)
- Tailwind + shadcn/ui components

## Setup
```bash
npm install
npm run dev
```

Requires a Base44 app id / credentials configured for your own environment. This repo is a source snapshot only — no production secrets or user data.

## Notes
- Excluded: `node_modules`, build outputs, `.env*`, `base44/.app.jsonc`
- App id (reference): `6ade675bb40e3961c7ac402f`
