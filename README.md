# SafeOps AI

```
 Expo app (QR ID, siren) ─┐                       ┌─> FastAPI + 2 YOLO models (PPE, fire/smoke)
                          ├─> Node/Express API ───┤
 Vite admin dashboard ────┘   (MySQL, Socket.IO)  └─> uploads/ (evidence)
```

## Folder structure
```
backend/src
  config/       index.js (env) · db.js (Sequelize/MySQL connection, auto-loads models)
  models/       Plant · Zone · Camera · User · Incident · AccessCheck   (sequelize, DataTypes) => Model + associate()
  controllers/  auth · plant · zone · camera · user · incident · checkpoint · monitor · stats
  routes/       *.routes.js  + index.js (mounted under /api)
  middleware/   auth (authenticate/authorize) · upload · asyncHandler · errorHandler
  services/     ai.service (calls your FastAPI) · incident.service · evidence.service
  sockets/      Socket.IO (rooms: user:<id>, zone:<id>, admins)
  utils/        crudFactory · crudRouter
  scripts/      sync.js (create tables) · seed.js (demo data)
  app.js · server.js

admin-dashboard/src
  api/          baseApi + RTK Query endpoints (auth, resource, incident, checkpoint, stats)
  store/        index.js · authSlice.js
  pages/        Login, Overview, Plants, Zones, Cameras, Users, Incidents, GateCheck, Monitor
  components/   layout/ · ui/ · resource/ (generic table + form)
  config/       constants.js · resources.jsx (field/column config per resource)
  hooks/        useWebcam · useLiveEvents     routes/  AppRoutes.jsx

mobile/src
  config/ · theme/ · api/ · context/ (AuthContext) · hooks/ (useSiren, useAlertSocket)
  components/ · screens/ · navigation/

ai-service/     your api.py, crop_check.py, fire_check.py, llm.py + models/
```

## Run order
1. **MySQL**: `CREATE DATABASE safeops;`
2. **AI service** (`ai-service/`): copy your own `api.py`, `crop_check.py`, `fire_check.py`, `llm.py` and `models/` into this folder, `pip install -r requirements.txt`, `uvicorn api:app --host 0.0.0.0 --port 8000` (see its README).
3. **Backend** (`backend/`): `cp .env.example .env` (set `DB_*`, note the variable is `DB_PASSWORD`) → `npm i` → `npm run seed` (creates tables + demo data; use `npm run db:sync` to only create missing tables) → `npm run dev`
4. **Dashboard** (`admin-dashboard/`): `cp .env.example .env` → `npm i` → `npm run dev` → http://localhost:5173
5. **Mobile** (`mobile/`): set your LAN IP in `src/config/index.js` → `npm i` → `npx expo install --fix` → `npx expo start` → scan with Expo Go

Table creation is NOT done on server start (sync is disabled in `config/db.js`, as in your other projects). Run `npm run seed` or `npm run db:sync` once.

Seed logins: admin@safeops.com / admin123 · super@safeops.com / super123 · ravi@safeops.com / worker123 · anita@safeops.com / worker123

## Demo script
1. Phone: log in as Ravi → ID tab shows a rotating QR.
2. Dashboard → Gate Check → pick "Welding Bay" → Start webcam → hold phone QR to webcam → Capture & verify. Helmet/vest/gloves/goggles all present → GRANTED; otherwise DENIED with the missing items. (No QR handy? Use the "Pick employee" + upload image/video demo mode.)
3. Dashboard → Incidents → "Trigger" fire in Welding Bay (or Live Monitor with a fire image/video) → Ravi's phone plays the siren with a full-screen alert. Resolve the incident → siren stops, zone back to normal.

## Safety logic (per zone)
requiredPpe (helmet/vest/gloves/goggles/boots) · allowedRoles · fireCheck · status (`alert` = lockdown, blocks all entry). Order of checks: active user → zone lockdown → role allowed → PPE (AI; an item the model cannot see counts as NOT verified → denied) → fire/smoke (AI, raises incident) → decision logged in `AccessChecks`.
