# Hyundai Ping Pong Bracket

16-team single-elimination table tennis bracket.

Live: https://aarontmai.github.io/Hyundai-Ping-Pong-Bracket/

## Shared saving (Firebase Realtime Database)

Names and results are stored in Firebase so everyone with the link sees the same bracket.
Anyone with the link can type team names, advance winners, reset results or clear the bracket.

1. Firebase console → create a project → **Build → Realtime Database → Create database** (United States, locked mode).
2. **Rules** tab: paste `firebase/database.rules.json` → Publish.
3. Put the database URL in `FIREBASE_DB` in `index.html`.

If `FIREBASE_DB` is blank, the page runs in local-only mode (saved in each browser).
