# FORME frontend

React 19 and Vite storefront, customer account and seller/admin workspaces. Start the complete project from the repository root with `npm run setup`, a configured Neon `backend/.env`, one-time `npm run db:setup`, and `npm run dev`; see the [main README](../README.md) and [demo guide](../docs/DEMO-GUIDE.md).

The dev server proxies `/api` to the local Express API (port 5050 by default; `FORME_API_PORT` overrides it). Set `VITE_API_URL` only when deliberately using another API environment. The browser normally uses one origin for UI, API and uploaded media.

- `src/pages/`: page implementations for customers, authentication and management.
- `src/components/forme/`: shared forms, dialogs, galleries and brand controls.
- `src/components/management/`: seller/admin navigation, tables and screens.
- `src/context/`: authenticated user, bag, saved-item, category and toast state.
- `src/index.css`: typography, palette, responsive layouts and reduced-motion rules.
- `public/images/`: local seed photography; attribution is in `../docs/photo-sources.json`.

Fonts are self-hosted using the pinned Fontsource packages. The gallery geometry and vendor report calculations have Node tests under `tests/`. From this directory, `npm run build`, `npm run lint` and `npm test` verify the frontend. API/database integration tests belong to the backend and run through root `npm test`.
