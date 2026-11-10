# DeltaBlock LiquidityDash

DeltaBlock LiquidityDash is a static, clickable prototype of a client portal for listed companies. It demonstrates the page structure, navigation, role-specific menus, and key user flows described in the LiquidityDash project brief.

> **Prototype only:** All portal data is sample data. This project has no backend, real authentication, server-side authorization, broker connection, or email delivery. Do not use it to store or display real client information.

## Run the prototype

The site is plain HTML, CSS, and JavaScript. To serve it locally, open a terminal in `deltablock-static` and run:

```powershell
py -m http.server 8000
```

Then open [http://localhost:8000/login.html](http://localhost:8000/login.html). If the `py` launcher is unavailable, use `python -m http.server 8000` instead.

The prototype can also be hosted by any static web server. There is no application server or database to start.

## Preview roles

On the login page, choose a role in **Prototype: sign in as** and submit the demo form. Each role has its own landing page and menu:

| Role | Landing page | Main areas |
| --- | --- | --- |
| Client | `dashboard.html` | Overview, market activity, trade history, peer comparison, reports, statements, subscription, company profile, team, support |
| Multi-company client | `companies.html` | Company overview and switcher, plus the client workspace for assigned companies |
| Guest | `dashboard.html` | Read-only overview, trade history, and reports |
| Admin | `admin.html` | Admin overview, companies, client sign-up links, access requests, users, subscriptions, data health, access log, support tickets, screen map |

The login page prefills sample credentials for the selected persona. These are for navigating the prototype only; the form does not authenticate a real account.

## Main flows and pages

### Client workspace

- `dashboard.html` — Client overview with headline KPIs, period selection, data status, peer summary, and recent items.
- `market.html` — Price and volume activity.
- `trades.html` — Trade history with date, side, and search filters, plus CSV export of the visible rows.
- `comparison.html` — Anonymised peer comparison and optional comparison with assigned companies.
- `reports.html` and `accounting.html` — Sample reports and statement rows.
- `subscription.html` — Plan, status, term, renewal, and included services.
- `company.html` — Company profile edit form with a local “under review” state.
- `team.html` — Client team list and invitation/access controls for the sample account owner.
- `tickets.html` and `ticket.html` — Support ticket list and sample conversation detail.

### Join and access flows

- `login.html` — Persona selector, login demo, and Request access form.
- `signup-links.html` — Admin creates client sign-up links for one or more companies, previews them, and creates replacement links.
- `signup.html` — Client account setup through a personal link; company access is displayed as fixed.
- `guest-invite.html` — Guest invitation acceptance flow.
- `password-reset.html` — Password reset request screen.
- `access-requests.html` — Admin reviews and approves or rejects access requests.

### Admin and prototype map

- `admin.html` — Admin summary and attention items.
- `companies.html` — Company overview; **Open** selects that company before opening its workspace.
- `users.html` — Admin-wide user list and company assignment controls.
- `admin-subscriptions.html` — Admin subscription settings.
- `data-health.html` — Sample feed freshness and status.
- `access-log.html` — Admin-only sample access log.
- `wireframes.html` — Clickable screen map showing the role menus, landing pages, and major flows.

## Sample data and browser storage

Sample company, KPI, subscription, document, feed, person, access-request, and ticket data is defined in `deltablock-static/js/data.js`.

Changes made while clicking through the prototype are saved in the current browser's `localStorage` under keys beginning with `dbt-`. This includes the demo session, selected company, invitations, sign-up links, access requests, subscriptions, profile changes, and ticket updates. Data is local to that browser and is not shared with another person or device. To restore the original sample state, clear this site's local storage in the browser's developer tools.

The included PDFs in `deltablock-static/reports/` are sample report files. Some document and email actions are presentation-only and show a message or expose a demo link instead of connecting to a document service or sending email.

## Styling and build

The source stylesheet is `deltablock-static/src/input.css`; generated styles are in `deltablock-static/css/style.css`. The project uses Tailwind CSS 3.4.17 and includes `package-lock.json`.

From `deltablock-static`, install the development dependency and rebuild CSS with:

```powershell
npm install
npm run build
```

To rebuild CSS automatically while editing:

```powershell
npm run watch
```

The existing generated CSS is already present, so installing dependencies is only needed when rebuilding or watching the stylesheet.

## Project structure

```text
.
├── README.md                    # This project overview
└── deltablock-static/
    ├── *.html                   # Portal pages and flows
    ├── js/
    │   ├── app.js               # Shared shell, role menus, helpers, local storage
    │   ├── data.js              # Sample data
    │   └── theme.js             # Theme preference handling
    ├── css/style.css            # Generated and supplemental styles
    ├── src/input.css            # Tailwind and custom style source
    ├── reports/                 # Sample report PDFs
    ├── package.json             # Build scripts and Tailwind dependency
    └── tailwind.config.js       # Tailwind content paths and theme
```

## Important implementation limits

- Role selection and page access checks run in browser JavaScript. They are useful for demonstrating menus and screens, but they do **not** secure data. A production service must authenticate users and enforce company access on the server for every request.
- All interactions and saved state are local to one browser. There is no API, database, email provider, audit pipeline, or live broker feed.
- KPI and feed values are illustrative. They do not represent live or verified trading data.
- The password reset screen demonstrates the request step only; a real reset-token and password-change flow must be provided by the authentication service.
- Private documents, company-profile approval, operational alerts, automated ingestion, tests, and deployment need production services and a technical plan beyond this static prototype.
