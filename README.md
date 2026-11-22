# DeltaBlock LiquidityDash

DeltaBlock LiquidityDash is a static, clickable prototype of a client portal for listed companies. It demonstrates the project structure, role-based navigation, company-level access, liquidity reporting, team management, subscriptions, support, and administrative workflows.

> **Prototype only:** The project contains sample data and simulates authentication, authorization, invitations, email, payments, and document storage in the browser. It has no backend, real security boundary, broker connection, external API, or email delivery. Do not enter or display real client information.

## Contents

- [Features](#features)
- [Roles and permissions](#roles-and-permissions)
- [Quick start](#quick-start)
- [Prototype sign-in](#prototype-sign-in)
- [Page guide](#page-guide)
- [How interactions work](#how-interactions-work)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Page states and preview controls](#page-states-and-preview-controls)
- [Building Tailwind CSS](#building-tailwind-css)
- [Resetting the prototype](#resetting-the-prototype)
- [Customization](#customization)
- [Known limitations](#known-limitations)

## Features

### Client workspace

- Company overview with liquidity KPIs and period controls
- Market activity and Deltablock volume versus total market volume
- Filterable trade history with totals and CSV export
- Peer and sector comparison charts
- Monthly reports and statements
- Subscription plan, contracted services, dates, targets, and renewal status
- Company profile management with an approval workflow
- Company team management
- Support tickets and message threads
- Personal account settings

### Administration

- Organization-wide admin overview
- Company creation and company details
- PDF report and statement publishing
- Company-based sign-up links
- Access request review
- Profile change review
- User and pending-admin management
- Subscription administration
- Data-feed health
- Access log
- Support ticket assignment and status management
- Visual screen map

### User experience

- Light and dark themes
- Responsive desktop and mobile layouts
- Loading, error, and empty-state previews
- Currency and time-zone-aware company data
- Delayed-feed warnings
- Target status for time-in-market and spread
- Browser-based toast notifications and dialogs

## Roles and permissions

Roles are simulated in `js/app.js`. Company access and Team-management rights are stored separately.

| Role | Access | Main landing page |
|---|---|---|
| Client | One or more assigned companies, depending on the account | Overview or Companies |
| Multi-company client | Multiple companies | Companies |
| Guest | Read-only access to approved company information | Overview |
| Admin | Organization-wide administration | Admin overview |

Role behavior includes:

- **Client / colleague:** Reads company data and can use permitted team and profile actions.
- **Company manager:** May edit the company profile and manage the Team for a company they manage.
- **Guest:** Can view Overview, Market activity, Trade history, Peer comparison, Reports, and Company profile. Guests cannot use Statements, Team, Subscription, or Support.
- **Admin:** Can manage companies, users, subscriptions, access requests, profile reviews, documents, feeds, and support.

The menu, direct page URLs, action buttons, and mutation functions use the shared permission helpers in `js/app.js`. These are prototype checks only and must not be reused as a production authorization system.

## Quick start

### Option 1: Open a local web server

The portal uses relative URLs and browser JavaScript, so it should be served over HTTP rather than opened with `file://`.

Using Python:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/login.html
```

Using Node.js, if a server package is installed globally:

```powershell
npx serve .
```

### Option 2: Build CSS and run

Requires Node.js and npm.

```powershell
npm install
npm run build
python -m http.server 8000
```

Open `http://localhost:8000/login.html`.

## Prototype sign-in

Open [login.html](login.html) and choose a persona in **Prototype: sign in as**.

| Persona | Simulated identity | Intended purpose |
|---|---|---|
| Client | Aisha Khan | One-company client and company manager |
| Multi-company client | Diego Alvarez | Multi-company navigation and company switching |
| Guest | Jordan Lee | Read-only company access |
| Admin | Khan Abid | Administrative workflows |

The password is intentionally not checked. Selecting a persona replaces the email and session persona. Other users created through sign-up links or invitations can sign in by entering their saved email address.

The login page also supports:

- Access requests
- Password-reset simulation
- Sign-up link registration
- Guest and colleague invitations
- Pending-admin setup links

## Page guide

### Authentication and account

| Page | Purpose |
|---|---|
| [login.html](login.html) | Persona selection and prototype sign-in |
| [signup.html](signup.html) | Create an account using a valid sign-up link |
| [password-reset.html](password-reset.html) | Simulated password reset |
| [account.html](account.html) | Update the signed-in user's name and email |
| [guest-invite.html](guest-invite.html) | Accept a guest or colleague invitation |

### Client pages

| Page | Purpose |
|---|---|
| [dashboard.html](dashboard.html) | Overview, KPIs, target status, peer summary, and latest items |
| [market.html](market.html) | Market volume, Deltablock share, price, and trading activity |
| [trades.html](trades.html) | Paginated trade history, filters, totals, and CSV export |
| [comparison.html](comparison.html) | Peer ranges and 3-month, 6-month, and 1-year comparisons |
| [reports.html](reports.html) | Published reports and PDFs |
| [accounting.html](accounting.html) | Statements and accounting documents |
| [subscription.html](subscription.html) | Contracted services, targets, term, and renewal |
| [company.html](company.html) | Company profile and manager edit workflow |
| [team.html](team.html) | Company team list and member invitations |
| [tickets.html](tickets.html) | Client support ticket list |
| [ticket.html](ticket.html) | Individual support conversation |

### Admin pages

| Page | Purpose |
|---|---|
| [admin.html](admin.html) | Organization-wide metrics and target status |
| [companies.html](companies.html) | Company list and company creation |
| [publish.html](publish.html) | Publish reports or statements to companies |
| [signup-links.html](signup-links.html) | Create and manage company-based sign-up links |
| [access-requests.html](access-requests.html) | Approve or reject access requests |
| [profile-reviews.html](profile-reviews.html) | Approve or reject proposed company profile changes |
| [users.html](users.html) | Users, colleagues, guests, and pending administrators |
| [admin-subscriptions.html](admin-subscriptions.html) | Review and edit company subscriptions |
| [data-health.html](data-health.html) | Data-feed status and freshness |
| [access-log.html](access-log.html) | Sample sign-in activity and search |
| [tickets.html](tickets.html) | Admin support-ticket queue |
| [wireframes.html](wireframes.html) | Map of prototype screens |

## How interactions work

### Company switching

Multi-company clients can open **Companies** and select a company. The active company is stored in `localStorage` under `dbt-company`. Data pages read that selection and use the appropriate currency, target, feed, and sample figures.

### Team management

Team membership is company-based:

- Everyone with access to a company can see the company Team.
- Company managers can invite colleagues or guests and change permitted management rights.
- Admins can manage users across the workspace.
- An invite is a browser-simulated action; no email is sent.

### Sign-up links

Admin-created sign-up links are assigned to one or more companies. A link does not reserve a name or email address. The recipient supplies both when registering.

The registration flow rejects duplicate email addresses, ignoring letter case. A used link records the resulting account after submission.

### Profile changes

Company managers can propose profile edits. Proposed changes are saved as review records under `dbt-profile-reviews`.

Admins approve or reject each review in [profile-reviews.html](profile-reviews.html). Approved fields are stored in `dbt-profile-approved` and applied on top of the sample company data.

### Published documents

Admins can publish a PDF to a company. Browser storage is used, with a 1 MB file-size limit. This is only a prototype document store and should not be used for confidential or real documents.

### Support tickets

Ticket status wording is role-aware:

- **With Deltablock** or **Waiting for your reply** for clients
- **Needs our reply**, **Waiting on client**, or **Resolved** in admin workflows

Older status values are migrated when the prototype loads.

### Data and persistence

Interactive changes are stored in browser `localStorage`:

- Session and selected company
- People and team membership
- Invitations and sign-up links
- Access requests
- Profile edits and approvals
- Support tickets
- Subscription updates
- Published document metadata and file content
- Theme preference

Only keys prefixed with `dbt-` belong to the prototype. Browser storage is specific to the browser and origin. Clearing site data or using another browser starts from a separate or empty prototype state.

## Project structure

```text
deltablock-static/
├── *.html                  # Individual portal pages
├── css/
│   └── style.css           # Compiled Tailwind and custom styles
├── js/
│   ├── app.js              # Shared shell, permissions, storage, workflows
│   ├── data.js             # Sample companies, users, KPIs, reports, tickets
│   └── theme.js            # Light/dark theme initialization
├── src/
│   └── input.css           # Tailwind input and custom source styles
├── reports/
│   └── *.pdf               # Sample PDF documents
├── package.json
├── tailwind.config.js
└── README.md
```

The HTML pages load `js/data.js` and `js/app.js`, then call `App.mount(...)` for the shared sidebar, top bar, role guard, company selection, page states, and content renderer.

## Data model

Sample data is centralized in [js/data.js](js/data.js).

Key collections include:

- `COMPANIES`: Company profile, exchange, share price, currency, time zone, feed state, and targets
- `ORDER`: Company display order
- `KPI`: Time-in-market, volume, spread, turnover, and Deltablock share by period
- `PEER_GROUPS`: Anonymized peer ranges
- `SUB`: Subscription plans and contracted services
- `REPORTS`: Report and statement metadata
- `LINKS`: Sign-up links
- `REQUESTS`: Access requests
- `PEOPLE`: Administrators, clients, colleagues, and guests
- `TICKETS`: Support tickets and conversation threads
- `ACCESS_LOG`: Sample sign-in records
- `FEEDS`: Feed freshness and status
- `MARKET`: Market trades and buy-side activity

Several values are deterministic: company series are generated from the company ID and a fixed seed, so Overview, Market activity, Trade history, and Peer comparison remain visually consistent for a session.

Sample companies include:

- Company 1: XETRA, EUR
- Company 2: Euronext, EUR
- Company 3: SGX Catalist, SGD

The sample data date is 23 October 2026.

## Page states and preview controls

Selected data pages support Normal, Loading, Error, and Empty previews:

- Overview
- Market activity
- Trade history
- Peer comparison
- Reports
- Statements

Use the **Prototype: preview this page as** control at the bottom of a supported page, or append a URL parameter:

```text
dashboard.html?state=loading
dashboard.html?state=error
dashboard.html?state=empty
```

Loading and error states demonstrate page behavior only. They do not represent real network failures or API responses.

## Building Tailwind CSS

Tailwind is configured in [tailwind.config.js](tailwind.config.js). Its content paths scan HTML pages and JavaScript files.

```powershell
npm run build
```

Build output:

```text
css/style.css
```

For development with automatic rebuild:

```powershell
npm run watch
```

Run `npm run build` after adding or changing Tailwind utility classes. Custom shared styles are maintained in [src/input.css](src/input.css).

## Resetting the prototype

To remove prototype state while preserving the theme:

```javascript
Object.keys(localStorage)
  .filter((key) => key.startsWith("dbt-") && key !== "dbt-theme-v2")
  .forEach((key) => localStorage.removeItem(key));

location.reload();
```

Run this in the browser developer console while on the prototype origin.

The application can also migrate saved schemas from earlier prototype versions in place. It does not reset existing browser data automatically.

## Customization

Main customization areas:

- [js/data.js](js/data.js): sample companies, KPIs, people, subscriptions, tickets, and reports
- [js/app.js](js/app.js): navigation, role behavior, company access, storage, workflows, and shared rendering helpers
- [tailwind.config.js](tailwind.config.js): Tailwind theme configuration
- [src/input.css](src/input.css): custom CSS and UI styles
- [js/theme.js](js/theme.js): theme initialization
- `*.html`: page-specific content and interactions
- [reports/](reports/): PDF files referenced by sample report data

When changing a page, update the sample data and role/navigation behavior together to keep Overview, Market activity, Trade history, and Peer comparison consistent.

## Known limitations

- No server-side authentication or authorization
- Passwords are not checked or stored securely
- Emails and invitations are not delivered
- Payment and subscription changes are simulated
- Documents can only be stored within browser limits
- Sample data is not live market data
- Browser local storage can be modified or cleared
- Demo state is not synchronized between devices or users
- Direct URLs do not establish a secure backend session
- PDF and CSV output is for demonstration only
