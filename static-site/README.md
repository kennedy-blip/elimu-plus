# Elimu Plus static site

This Python/Jinja2 site is the production build target for the Elimu Plus transition. The former React/Vite source remains in `src/` for reference and local comparison; it is not included in the production build. The application is intentionally browser-only: learner data stays on the current device, with no accounts or cross-device sync.

The current public baseline is [`https://elimu-plus.onrender.com`](https://elimu-plus.onrender.com). A successful local build is not evidence of a Render deployment.

## Target and structure

- Python 3.11 build-time renderer with Jinja2; the generated site is plain static HTML, CSS, JSON, and browser JavaScript.
- `templates/index.html` — Jinja template, including a server-rendered grade chooser for the first paint.
- `data/learning-content.json` — static CBC levels, competencies, quizzes, lesson and lab catalogs, language phrases, offline items, and sample parent/service content.
- `static/css/` and `static/js/` — responsive UI, client-side interactions, and pure calculation helpers.
- `site-config.json` — public title, description, storage key, and version.
- `build.py` — renders and copies the static inputs to `dist/`.
- `tests/` — Python build/output checks and Node tests for calculations and view rendering.

## Build and preview

```sh
cd static-site
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python build.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000` for a local preview. The generated `static-site/dist/` and root `dist/` directories are ignored by Git. From the repository root, `npm run build` creates a temporary Python environment, installs the pinned Jinja2 dependency, and builds the publishable site into root `dist/`; `npm run dev` builds and serves that output. The root `render.yaml` declares a static Render service on `main` with automatic deploys on commits, the same build command, and root `dist` as its publish directory. The Render connector is unavailable in this session, so whether the existing production service is linked to this Blueprint and whether its dashboard settings match remain unverified.

## Local verification checkpoint (2026-11-24)

- The static build emitted 9 files; Python build tests passed (3) and Node tests passed (19). The repository-root `npm run build` also produced the 9-file `dist/` publish bundle.
- A one-time, read-only migration imports the existing learner's IndexedDB profile and supported progress on first load when the old `elimu-plus-db` is available on the same origin. It leaves that database untouched and deliberately excludes API keys, AI chat history, and portfolio file bytes; the imported state remains in this browser's local storage.
- Temporary headless Chromium runs exercised the grade chooser, invalid and valid onboarding entries, quiz scoring/persistence, lesson completion, lab controls, offline/download toggles, competency updates, portfolio/service/reflection forms, parent tabs/messages, editable settings profile, the local tutor, voice notes, search, back/forward navigation, reload persistence, JSON export, and data reset.
- At a 390 px viewport, all 12 primary workspace views plus the search-results route were traversed with no horizontal overflow. Browser console/page errors and failed requests were absent in the responsive run.
- The landing page was checked against the fetched production text baseline: 23 phrases covering the chooser, all three CBC level names/ranges, descriptions, and feature bullets match.
- The browser harness/tooling was temporary and is not included as a project dependency or repeatable test command. This is interaction/responsive smoke evidence plus a text check, not a screenshot comparison with production; screenshot-level visual parity and the live Render deployment remain unverified.

## Tests

```sh
cd static-site
.venv/bin/python -m unittest discover -s tests -v
node --test tests/*.test.mjs
```

The Node tests use the built-in test runner and require no additional Node packages.

## Known limits and data safety

- The app shell, grade selection, onboarding, dashboard, navigation, portfolio metadata, competency progress, quizzes, lesson previews, small lab simulations, language flashcards, community-service log, offline flags, voice notes, parent demo view, and settings are implemented as a local browser demo.
- User-entered demo state is stored in this browser's `localStorage`. The one-time legacy import described above copies supported records from the old app's IndexedDB on the same origin; there is still no server-side account or database, and this browser's data does not sync to other devices.
- Lesson media, uploads, school records, and parent messages are illustrative/local-only. Portfolio entries save metadata, not uploaded files; offline buttons toggle a demo state rather than downloading curriculum files.
- Voice input uses browser speech recognition when available and a short local sample transcript otherwise.
- The tutor uses built-in example responses only. The old `.env` file and any API keys are not copied into this directory; no OpenAI key or external AI endpoint is included in the generated site.
- The root repository currently tracks `.env` with a `VITE_` key name. Vite-prefixed values are client-visible if included in a build. If that value is a real credential, rotate it and move secret use behind a server; it was not printed or modified during this work.

## Deployment status

The committed Blueprint targets a Render Static Site named `elimu-plus` on `main`; the build outputs to root `dist/`, and automatic deploys on commits are configured via `autoDeployTrigger: commit`. The Render connector is unsupported, so I cannot confirm that the existing `elimu-plus.onrender.com` service is Blueprint-managed, that these settings have been applied, or that a deployment has succeeded. The public site is not considered transitioned until the merged build is observed at the production URL.
