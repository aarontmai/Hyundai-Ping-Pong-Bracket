# Hyundai Ping Pong Bracket

16-team single-elimination table tennis bracket.

Live: https://aarontmai.github.io/Hyundai-Ping-Pong-Bracket/

## Shared saving (Google Sheets)

Names and results are stored in a Google Sheet so everyone with the link sees the same bracket.
Anyone can type team names; only someone with the admin passcode can advance winners or clear the bracket.

1. Create a Google Sheet → **Extensions → Apps Script**.
2. Paste `apps-script/Code.gs`, set `ADMIN_PASSCODE`, and save.
3. **Deploy → New deployment → Web app** — Execute as: *Me*, Who has access: *Anyone*.
4. Copy the Web app URL into `SHEET_API` in `index.html`.

If `SHEET_API` is blank, the page runs in local-only mode (saved in each browser).
