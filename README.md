# Shiftly

A mobile-first, on-device healthcare staffing converter. Paste a list, convert it into one list with separate CNA and Nurse sections, and copy the full list into a group chat.

## Run

- `npm install`
- `npm run dev`
- `npm test` — parser fixtures and edge cases
- `npm run lint`
- `npm run build` — static site and offline service worker in `dist/`
- `npm run preview` — preview the production PWA
- `npm run test:e2e` — build and run mobile browser and offline tests (uses installed Microsoft Edge)

## Parser

`src/parser/` is independent of React. Input normalization, role/date/shift parsing, note extraction, grouping, and output formatting are separate modules. Tests in `src/tests/` include the development guide's real staffing fixture.

Facility and role context survives blank lines and role changes. Counts map to AM / PM / NOC; Nurse-only two-count rows map to AM / PM. Standard explicit time ranges are supported. Notes stay with their date. Repeated facilities are grouped within each role and dates sort by month and day.

Ambiguous rows and unknown headings appear in Needs Review while valid rows remain copyable. Unrecognized parent-company headings are reviewed, not used as facility names. Unknown context resets facility/role to avoid attributing subsequent rows incorrectly. All-zero rows are omitted; all-zero rows with notes are reviewed so notes are not lost. Yearless February 29 is accepted. Non-parenthesized notes and nonstandard time ranges are reviewed instead of guessed.

## Privacy and offline use

No backend, network parser, analytics, or staffing-text persistence. Text lives only in React memory. The service worker caches static application assets, not staffing information. No local preference or history storage is enabled in V1.

Deploy `dist/` to static hosting (Vercel: build command `npm run build`, output directory `dist`). Use HTTPS. Open the production app online and wait for **Offline Ready** before closing it. Service workers are intentionally disabled in the development server. Updates wait until existing app windows close, avoiding loss of in-progress text.

## iPhone acceptance check

Browser tests emulate mobile dimensions and verify reopening, conversion, and clipboard use while offline. They do not replace a physical iPhone check:

1. Open the deployed HTTPS site in Safari and wait for Offline Ready.
2. Use Share → Add to Home Screen, then open the installed app.
3. Disable Wi-Fi and cellular, close the app, and reopen it.
4. Paste the guide's sample and convert. Confirm CNA/Nurse separation and notes.
5. Copy the full list and paste into another app.
6. Check keyboard scrolling, safe areas, clear/edit, and Needs Review rows.

The UI uses bundled Phosphor icons. App installation icons are sized from src/assets/logo.png.
