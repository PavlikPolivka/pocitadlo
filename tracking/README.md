# Usage tracking

The app sends play events (app open, level start/finish/quit, time, mistakes)
to a Google Apps Script web app. The script stores them in a Google Sheet and
emails a daily summary between 19:00 and 19:15, covering everything since the previous one. It costs nothing and has no server to maintain.

Nothing is sent when `NEXT_PUBLIC_TRACK_URL` is not set, e.g. in local dev.

## Setup (once, ~5 minutes)

1. Create a new Google Sheet (e.g. "Počítadlo data").
2. **Extensions → Apps Script**. Replace the code with `Code.gs` from this
   folder and set `EMAILS` to the addresses that should get the report.
3. Select the `setup` function and click **Run**. Approve the permissions
   (Sheets, sending email, triggers). This creates the `events` sheet and the
   15-minute trigger that sends the report once a day after 19:00.
4. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access
   **Anyone**. Copy the `/exec` URL.
5. In Vercel → project → Settings → Environment Variables, add
   `NEXT_PUBLIC_TRACK_URL` = that URL, then redeploy.
6. Open the app on the iPad once. A row should appear in the sheet. To test
   the email, run `dailyReport` from the Apps Script editor.

When you change `Code.gs` later, use **Deploy → Manage deployments → Edit →
New version** so the URL stays the same.

## Notes

- Events are queued in localStorage and sent when the iPad is online.
- The email is skipped on days with no activity.
- The URL is visible in the app bundle; the script only accepts known event
  types, so the worst case is junk rows in the sheet.
