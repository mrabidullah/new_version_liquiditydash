# Deltablock static prototype

Clickable HTML prototype of the Deltablock client portal. Sample data only (`js/data.js`); changes you make while clicking
around (invites, tickets, sign-up links, requests) are kept in your browser's localStorage.

Start at `login.html` and pick a role in "Prototype: sign in as": client, multi-company client, guest or admin.
Every page uses the same sidebar and top bar from `js/app.js`; each role gets its own menu and landing page.

After changing a page's classes run `npm run build` to rebuild `css/style.css`.


## Update: company-based Team, admin workflows and permissions

Static prototype (HTML, Tailwind, vanilla JS, localStorage). Nothing here is a production security boundary: permissions, sign-up, "email" and passwords are simulated in the browser. No email is sent and passwords are neither stored nor checked.

- **Permissions** live in `js/app.js` (`App.can`, `App.resolve`). Company access (`people[].companies`) and Team-management rights (`people[].manages`) are separate. Menus, direct URLs, buttons and the mutation functions (`App.inviteMember`, `App.createCompany`, `App.reviewProfile`, ...) all use the same checks.
- **Team** belongs to a company: everyone with access to a company sees the same list; only company managers and admins change it.
- **Companies** can be added by admins (`companies.html`); companies without feeds show "Not available" instead of invented numbers.
- **Sign-up links** are company-based (no name/email); registration rejects existing emails case-insensitively.
- **Profile changes** are stored as review records (`dbt-profile-reviews`) and applied only when an admin approves (`profile-reviews.html`).
- **Add admin** creates a pending admin with a setup link on `users.html`.
- Saved data from earlier versions is migrated in place (`migrate()` in `app.js`); nothing is reset automatically. To start clean, run `Object.keys(localStorage).filter(k=>k.startsWith('dbt-')&&k!=='dbt-theme-v2').forEach(k=>localStorage.removeItem(k))` in the browser console.
- Build CSS: `npm install && npm run build`. Run locally: `python3 -m http.server 8000`, then open `http://localhost:8000/login.html`.


## Update: client feedback round 4

- **Company profile**: read-only by default; managers get *Edit profile* (modal). Current vs proposed table and admin review workflow unchanged. Guests and non-managers are read-only.
- **Market activity**: stacked daily volume (Deltablock + other participants = total market) with market price, plus six metrics. Figures are pinned to `KPI` and `MARKET` in `js/data.js`. Active trading partners removed here and on Overview.
- **Peer comparison**: range charts with 3 months / 6 months / 1 year (derived from the 30-day sample data).
- **Subscription**: contracted services, targets, term and renewal; no contract document. Plans never change navigation.
- **Team** list first with *Invite someone* modal; **Admin Subscriptions** table first with an Edit side panel; **Companies** without Total volume; **Trade history** totals above filters.
- **Support tickets**: statuses Needs our reply / Waiting on client / Resolved (older saved `await`/`prog` are migrated); admin Status + Company filters.
- **Guests**: read-only Overview, Market activity, Trade history, Peer comparison, Reports, Company profile; no Statements, Team, Subscription, Support.
- **My account** (`account.html`, opened from your name in the top bar): own name, email, password. Passwords remain a simulation (sign-in still does not check them).
