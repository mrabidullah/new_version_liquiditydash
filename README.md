# DeltaBlock LiquidityDash

**A clickable HTML prototype of the DeltaBlock client portal.**

DeltaBlock LiquidityDash is a static frontend prototype designed to demonstrate the client portal experience for listed companies. It includes role-based navigation, company management, market activity, trade history, peer comparisons, reports, subscriptions, team management, support tickets, and administrative workflows.

> **Prototype Notice:** This is a demonstration project using sample data. It does not include production authentication, backend APIs, server-side permissions, a database, live broker connections, or real email delivery. All interactive changes are stored locally in the browser.

---

## 1. Project Overview

The prototype is built with:

- HTML5
- CSS3
- Tailwind CSS 3.4.17
- Vanilla JavaScript
- Browser LocalStorage

The shared application logic is managed through `js/app.js`, while sample project data is maintained in `js/data.js`.

Every page uses a consistent navigation sidebar and top bar. Available pages and menus depend on the selected demonstration role.

## 2. Getting Started

### Requirements

- Node.js and npm (required for rebuilding CSS)
- Python 3 (for running the local development server)
- A modern web browser

### Run Locally

Open a terminal in the project directory and run:

```powershell
py -m http.server 8000
```

Then open:

http://localhost:8000/login.html

If the `py` command is unavailable, use:

```powershell
python -m http.server 8000
```

The project can also be hosted on any static web server.

### Rebuild CSS

Install dependencies:

```powershell
npm install
```

Build the stylesheet:

```powershell
npm run build
```

To automatically rebuild CSS while editing:

```powershell
npm run watch
```

The generated stylesheet is located at `css/style.css`, and its source is `src/input.css`.

## 3. Demo Roles and Navigation

Start at `login.html` and select a role using **Prototype: sign in as**.

| Role | Landing Page | Main Features |
|---|---|---|
| Client | `dashboard.html` | Overview, market activity, trades, peer comparison, reports, statements, subscriptions, company profile, team and support |
| Multi-company Client | `companies.html` | Assigned companies, company switching and client workspace |
| Guest | `dashboard.html` | Read-only company information, market activity, trade history, reports and peer comparison |
| Admin | `admin.html` | Admin dashboard, companies, users, access requests, subscriptions, data health, access logs and support |

The login form uses demonstration personas and does not authenticate real users or verify real passwords.

## 4. Main Application Features

### Client Workspace

- **Overview (`dashboard.html`):** Company KPIs, reporting periods, data status, peer summary and recent activity.
- **Market Activity (`market.html`):** Daily market volume, price activity and market performance metrics.
- **Trade History (`trades.html`):** Trade records, date and side filters, totals and CSV export.
- **Peer Comparison (`comparison.html`):** Anonymous peer comparisons with selectable reporting periods.
- **Reports (`reports.html`):** Published sample reports and documents.
- **Statements (`accounting.html`):** Sample accounting and statement information.
- **Subscription (`subscription.html`):** Contracted services, targets, subscription status, term and renewal.
- **Company Profile (`company.html`):** Company information and profile change workflows.
- **Team (`team.html`):** Company-based team members, invitations and access management.
- **Support (`tickets.html`, `ticket.html`):** Support ticket management and conversation views.
- **My Account (`account.html`):** Personal account details and simulated password management.

### Registration and Access Management

- **Login (`login.html`):** Demonstration login and access request form.
- **Sign-up Links (`signup-links.html`):** Company-based client registration links.
- **Sign-up (`signup.html`):** Client account setup through a registration link.
- **Guest Invitation (`guest-invite.html`):** Guest invitation acceptance workflow.
- **Password Reset (`password-reset.html`):** Demonstration password reset request.
- **Access Requests (`access-requests.html`):** Admin review and approval of access requests.

### Administration

- **Admin Dashboard (`admin.html`):** Administrative overview and attention items.
- **Companies (`companies.html`):** Company listing, company selection and management.
- **Users (`users.html`):** User management, company assignments and pending admin setup.
- **Admin Subscriptions (`admin-subscriptions.html`):** Subscription management and editing.
- **Data Health (`data-health.html`):** Sample feed status and freshness information.
- **Access Log (`access-log.html`):** Demonstration administrative access history.
- **Profile Reviews (`profile-reviews.html`):** Admin review and approval of proposed profile changes.
- **Publish Documents (`publish.html`):** Publishing sample PDF reports and statements to companies.
- **Wireframes (`wireframes.html`):** Clickable screen map of the application.

---

## 5. Permissions and Company Management

The prototype demonstrates company-based access and role-specific permissions.

Permission logic is maintained in `js/app.js` through:

- `App.can`
- `App.resolve`

Company access (`people[].companies`) and team-management permissions (`people[].manages`) are handled separately.

The prototype applies permission checks to navigation menus, direct page access, buttons and relevant mutation functions.

### Team Management

- Team membership belongs to a company.
- Users with access to the same company see its team.
- Company managers and administrators can manage team members.

### Company Management

- Administrators can add and manage companies.
- Companies without available feeds display a Not Available state rather than fabricated figures.
- Administrators can correct company details through the company profile workflow.

### Registration and Profile Reviews

- Registration links are associated with companies.
- Existing email addresses are checked case-insensitively in the demonstration.
- Profile changes are saved as review records.
- Administrators can approve or reject proposed profile changes.
- New administrator accounts use a simulated setup-link workflow.

**Important:** These permission checks run entirely in browser JavaScript. They demonstrate application behavior but do not provide real security.

---

## 6. Client Feedback Updates

### Feedback Round 4

- Company profiles are read-only by default, with editing available to authorized company managers.
- Market activity includes daily market volume and price information.
- Peer comparison supports 3-month, 6-month and 1-year views.
- Subscription pages display contracted services, targets, terms and renewals.
- Team and administration tables have been reorganized.
- Support tickets use Needs Our Reply, Waiting on Client and Resolved statuses.
- Guest accounts have read-only access to permitted pages.
- Personal account management is available through the top navigation.

### Feedback Round 7

- Data dates, reporting periods, time zones and delayed-feed warnings appear on relevant pages.
- Preview states support Normal, Loading, Error and Empty modes.
- Company-specific administration pages are available to administrators.
- Company target status appears on Companies and Admin Overview.
- Subscription panels display service-level contract information and status.
- Administrators can publish sample PDF reports and statements.
- Trade history supports filtered totals, pagination and CSV export.
- Application terminology has been standardized across relevant pages.

### Additional Improvements

- Company-based team management and permission handling.
- Improved administrator workflows and subscription management.
- Company-specific sign-up links.
- Profile review and approval workflows.
- Improved market activity and peer comparison displays.
- Consistent page layouts and role-based navigation.

---

## 7. Sample Data and Browser Storage

Sample data is maintained in:

`js/data.js`

The prototype uses browser `localStorage` to save demonstration changes, including:

- Demo sessions and selected companies.
- Team invitations.
- Registration links.
- Access requests.
- Subscription changes.
- Profile change requests.
- Support ticket updates.

Stored data is specific to the browser and device. It is not shared with other users.

### Reset Demonstration Data

To restore the original sample state, clear the site's LocalStorage through the browser's developer tools.

The application includes a migration mechanism (`migrate()` in `js/app.js`) to preserve compatible data from earlier prototype versions.

---

## 8. Project Structure

```text
.
├── README.md
├── login.html
├── dashboard.html
├── market.html
├── trades.html
├── comparison.html
├── reports.html
├── accounting.html
├── subscription.html
├── company.html
├── team.html
├── account.html
├── admin.html
├── companies.html
├── users.html
├── admin-subscriptions.html
├── signup.html
├── signup-links.html
├── guest-invite.html
├── password-reset.html
├── access-requests.html
├── access-log.html
├── data-health.html
├── profile-reviews.html
├── publish.html
├── tickets.html
├── ticket.html
├── wireframes.html
├── js/
│   ├── app.js
│   ├── data.js
│   └── theme.js
├── css/
│   └── style.css
├── src/
│   └── input.css
├── reports/
│   ├── annual-market-review.pdf
│   ├── monthly-liquidity-review.pdf
│   └── trading-activity-summary.pdf
├── package.json
├── package-lock.json
└── tailwind.config.js
```

---

## 9. Technical Limitations

This project is a static frontend prototype, not a production application.

The following capabilities are simulated:

- Authentication and password management.
- Role-based permissions and company access.
- User registration and invitations.
- Email and notification workflows.
- Company profile approvals.
- Subscription management.
- Document publishing.
- Support ticket operations.
- Market and trading data.

There is currently no:

- Backend API or server-side business logic.
- Production authentication or authorization.
- Database or persistent server-side storage.
- Live trading or broker integration.
- Real email delivery service.
- Production document storage.
- Server-side audit logging.

All sample figures are illustrative and must not be treated as live or verified financial information.

A production implementation requires secure backend services, database persistence, server-side permissions, authentication, document storage and appropriate integrations.

---

## 10. Project Status

**Current Status:** Static Frontend Prototype

The project demonstrates the main DeltaBlock LiquidityDash interface, user journeys, company workflows, role-specific navigation and administrative functionality.

It provides a frontend foundation for a future production implementation with a secure backend and persistent database.

---

**DeltaBlock LiquidityDash**  
*Client Portal Frontend Prototype*
