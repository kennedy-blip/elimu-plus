# Elimu Plus static-site prototype

This is an **independent migration prototype**. The existing React/Vite application remains at the repository root; this directory does not replace it, change the production deploy configuration, or perform a Render cutover.

The public production baseline is still [`https://elimu-plus.onrender.com`](https://elimu-plus.onrender.com). A successful local build is not evidence of Render staging or production parity.

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

Open `http://localhost:8000` for a local preview. The generated `dist/` directory is ignored by Git. For a future Render static-site staging service, a *proposal only* would be root directory `static-site`, build command `python3 -m pip install -r requirements.txt && python3 build.py`, and publish directory `dist` (assuming Render's selected runtime provides Python 3.11). **No Render service has been created or changed in this work.** Verify the actual dashboard runtime/root/build/publish settings and use a separate staging service before considering any cutover.

## Local verification checkpoint (2026-11-24)

- Build completed with 8 output files; Python build tests passed (2) and Node tests passed (13).
- Temporary headless Chromium runs exercised the grade chooser, invalid and valid onboarding entries, quiz scoring/persistence, lesson completion, lab controls, offline/download toggles, competency updates, portfolio/service/reflection forms, parent tabs/messages, settings, the local tutor, voice notes, search, reload persistence, JSON export, and data reset.
- At a 390 px viewport, all 12 primary workspace views plus the search-results route were traversed with no horizontal overflow. Browser console/page errors and failed requests were absent in the responsive run.
- The landing page was checked against the fetched production text baseline: 23 phrases covering the chooser, all three CBC level names/ranges, descriptions, and feature bullets match.
- The browser harness/tooling was temporary and is not included as a project dependency or repeatable test command. This is interaction/responsive smoke evidence plus a text check, not a screenshot comparison with production; visual parity and Render staging remain unverified.

## Tests

```sh
cd static-site
.venv/bin/python -m unittest discover -s tests -v
node --test tests/*.test.mjs
```

The Node tests use the built-in test runner; no Node package dependencies are required for this prototype.

## Prototype limits and data safety

- The app shell, grade selection, onboarding, dashboard, navigation, portfolio metadata, competency progress, quizzes, lesson previews, small lab simulations, language flashcards, community-service log, offline flags, voice notes, parent demo view, and settings are implemented as a local browser demo.
- User-entered demo state is stored in this browser's `localStorage`. The old app's IndexedDB profile is **not** imported, and this prototype has no server-side accounts or database.
- Lesson media, uploads, school records, and parent messages are illustrative/local-only. Portfolio entries save metadata, not uploaded files; offline buttons toggle a demo state rather than downloading curriculum files.
- Voice input uses browser speech recognition when available and a short local sample transcript otherwise.
- The tutor uses built-in example responses only. The old `.env` file and any API keys are not copied into this directory; no OpenAI key or external AI endpoint is included in the generated site.
- The root repository currently tracks `.env` with a `VITE_` key name. Vite-prefixed values are client-visible if included in a build. If that value is a real credential, rotate it and move secret use behind a server; it was not printed or modified during this work.

## Deployment status

Render's dashboard could not be inspected from this session. The hostname suggests a production service named `elimu-plus`, but service type and actual root directory, build command, and publish directory are unverified. This prototype has only been built and tested locally; production settings remain untouched, and staging/parity checks are still outstanding.
