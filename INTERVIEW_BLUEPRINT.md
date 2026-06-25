# FranchiseeHub — Elite Interview Blueprint

---

## SECTION 1: COMPREHENSIVE ARCHITECTURE & DATA FLOW

### Backend Architecture Pattern

The backend uses a classic **MVC (Model-View-Controller)** pattern layered inside an **Express.js REST API**:

- **Model layer** — `backend/models/` — Mongoose schemas, no business logic
- **Controller layer** — `backend/controllers/` — All business logic lives here
- **Route layer** — `backend/routes/` — Pure routing, maps HTTP verbs/paths to controller methods
- **View** — There is no server-side view; the "view" is the React SPA
- **Utility layer** — `backend/utils/emailService.js` — A shared service module (not a controller)
- **Config layer** — `backend/config/config.js` — Centralizes environment variable access

The backend exposes **three route namespaces** mounted in `server.js`:

```
/admin/*        → routes/admin.js     → adminController.js
/applicant/*    → routes/applicant.js → applicantController.js
/franchisee/*   → routes/franchisee.js → franchiseeController.js
```

### Frontend Architecture Pattern

The frontend uses a **Component-Based SPA** pattern with **React Router v7 for client-side routing** and a **flat props-drilling state model** (no Redux, no Context API):

- `main.jsx` — React root mount
- `App.jsx` — BrowserRouter + top-level route declarations
- `pages/` — Page-level "smart" components that own state and data fetching
- `components/` — Presentational or logic-specific components organized by feature domain (`admin/`, `franchisee/`, `common/`, `layout/`)
- `config/api.js` — Centralized API URL resolution

---

### File-by-File Data Flow: New Application Submission

This is the most important full-stack flow to master. Every layer is touched.

**Step 1 — User Action (UI)**

`/apply` → `pages/ApplicationForm.jsx`
The user fills a controlled form. `useState` holds all 12 fields in a single `formData` object. On submit, `handleSubmit` calls `e.preventDefault()`, sets `loading = true`, and fires:

```js
axios.post(`${API_BASE_URL}/applicant/apply`, formData)
```

**Step 2 — API Config Resolution**

`config/api.js` resolves `API_BASE_URL` from `import.meta.env.VITE_API_URL`. In dev this is `http://localhost:2016`, in prod `https://franchiseehub-backend.onrender.com`.

**Step 3 — HTTP Transit**

Axios sends a `POST` request with `Content-Type: application/json`. CORS on the backend validates the origin against `allowedOrigins`. Since `credentials: true` is set, cookies can travel too.

**Step 4 — Express Route Match**

`server.js` has `app.use('/applicant', applicantRoutes)`. Express matches `POST /applicant/apply` and dispatches to `applicantController.submitApplication`.

**Step 5 — Controller Business Logic** (`applicantController.js`)

```
1. Destructure req.body fields
2. Applicant.findOne({ email }) — duplicate check
3. If exists → return { stat: false, msg: 'Application already exists' }
4. new Applicant({ ...fields, status: 'pending', doa: new Date() }).save()
5. Admin.find({}, 'email') — fetch all admin emails
6. Loop: emailService.sendNewApplicationNotification(...) for each admin
7. Email errors are caught locally → application save is NOT rolled back
8. Return { stat: true, msg: 'Application submitted successfully' }
```

**Step 6 — Mongoose / MongoDB**

Mongoose validates the Applicant schema, inserts into the `applicants` collection with a unique index on `email`. `timestamps: true` auto-sets `createdAt`/`updatedAt`.

**Step 7 — Email Side Effect** (`utils/emailService.js`)

Nodemailer creates an HTML email using `getNewApplicationAdminTemplate()` and sends via Gmail SMTP. This runs inside a `try/catch` in the controller — failure does NOT fail the application submission.

**Step 8 — Response Propagates Back**

`res.json({ stat: true })` → Express sends 200 JSON → Axios `.data` → React sets `setSubmitted(true)` → UI renders the success screen.

---

### File-by-File Data Flow: Franchisee Login

**Step 1** — `pages/UnifiedLogin.jsx` handles one login form for both roles. On submit:

```js
// Tries admin first
const adminResponse = await axios.post(`${API_BASE_URL}/admin/login`, formData)
if (adminResponse.data.stat) {
  localStorage.setItem('email', formData.email)
  localStorage.setItem('userType', 'admin')
  navigate('/admin')
  return
}
// Falls through to franchisee
const franchiseeResponse = await axios.post(`${API_BASE_URL}/franchisee/login`, formData)
```

This means **every login fires two sequential HTTP requests** when the user is a franchisee.

**Step 2** — `franchiseeController.login`:

```js
const franchisee = await FranchiseCredential.findOne({ email })
// bcrypt comparison via instance method — password never sent to MongoDB
if (franchisee && await franchisee.comparePassword(password)) {
  req.session.franchiseeEmail = email
  req.session.userType = 'franchisee'
  res.json({ stat: true })
}
```

**Step 3** — Frontend receives `stat: true`, writes to `localStorage`, navigates to `/franchisee`.

**Step 4** — `pages/FranchiseeDashboard.jsx` loads. Its `useEffect` reads `localStorage.getItem('userType')`. If it's not `'franchisee'`, it redirects to `/login`. This is the only "auth guard".

---

## SECTION 2: CORE STACK & FILE ROLES

### All Backend Mongoose Models

**1. Admin** (`models/Admin.js`) → Collection: `admins`

```
email      String  required, unique
password   String  required (BCRYPT HASHED as of latest update)
fname      String  default ''
lname      String  default ''
name       String  legacy field kept for backwards compat
role       String  default 'admin'
timestamps: true

Mongoose Hooks:
- pre('save'): Automatically hashes password with bcrypt (salt rounds: 10) if modified
- comparePassword(candidatePassword): Instance method for login verification
```

No relationships — standalone document. No index beyond the default `_id` and `unique` on email.

**2. Applicant** (`models/Applicant.js`) → Collection: `applicants`

```
fname, lname       String  required
email              String  required, unique, indexed
phone              String
res_address        String
buis_name          String  (business name)
site_address       String
site_city          String
site_postal        String
area_sqft          String  (stored as String, not Number — potential bug)
site_floor         String
ownership          String  ("Owned" | "Rented")
doa                Date    default: Date.now  (Date of Application)
status             String  default: 'pending'
strict: false              allows extra fields not in schema
timestamps: true
```

**Relationship style: referenced by email** (not ObjectId). Both `FranchiseCredential` and `SalesData` reference `Applicant` documents via the `email` string field — a **denormalized, soft reference** pattern rather than a hard MongoDB `$ref` or ObjectId ref.

**3. FranchiseCredential** (`models/FranchiseCredential.js`) → Collection: `franchise_credentails`

```
email     String  required, unique
password  String  required (BCRYPT HASHED as of latest update — nanoid(10) raw value hashed on save)
dof       Date    default: Date.now  (Date of Franchise)
timestamps: true

Mongoose Hooks:
- pre('save'): Automatically hashes password with bcrypt (salt rounds: 10) if modified
- comparePassword(candidatePassword): Instance method for login and password-change verification
```

Notable: The collection name has an intentional typo (`credentails` not `credentials`) preserved for backwards database compatibility. This is a real interview talking point.

**4. SalesData** (`models/SalesData.js`) → Collection: `t_sales_data`

```
email       String  required, indexed
dos         Date    required  (Date of Sale)
sale        Number  required  (revenue amount in ₹)
customers   Number  required
orders      Number  default 0
items_sold  Number  default 0
timestamps: true
Compound index: { email: 1, dos: 1 }
```

The compound index is the performance-critical piece — all `getSales` queries filter by `email` and optionally `dos` range. Without this index, queries would do full collection scans.

**Model Relationships Summary:**

```
Admin ──────────── (no direct DB relationship to others)
Applicant ──email──▶ FranchiseCredential  (one-to-one, after grant)
Applicant ──email──▶ SalesData            (one-to-many, after grant)
```

This is a **referencing (normalized) pattern** but using `email` strings as foreign keys instead of ObjectIds — faster lookups but no referential integrity enforced by MongoDB.

---

### Directory Purpose Summary

| Path | Purpose |
|---|---|
| `backend/` | Node.js API server — all server-side logic |
| `backend/config/` | Environment variable centralization |
| `backend/controllers/` | Business logic for each user role |
| `backend/models/` | Mongoose schemas — database shape definitions |
| `backend/routes/` | Express router definitions — URL-to-controller mapping |
| `backend/utils/` | Shared services (email) not tied to one controller |
| `frontend/src/pages/` | Top-level route components that own state and fetch data |
| `frontend/src/components/admin/` | Admin-specific UI (dashboard, applications, franchises) |
| `frontend/src/components/franchisee/` | Franchisee-specific UI (sales, calendar, analysis) |
| `frontend/src/components/common/` | Fully reusable UI atoms (buttons, modals, inputs, badges) |
| `frontend/src/components/layout/` | Persistent shell UI (sidebars) |
| `frontend/src/config/` | API URL resolution for all environments |
| `Images/` | Screenshots for README documentation, not used in app code |

---

### Top 5 Dependencies

**Backend:**

**1. `express` v5.2.1**

The web framework. v5 (currently in beta/RC) is used here — notable because v5 changes error handling to automatically forward async errors to `next()` without needing `try/catch` wrappers. The app still uses manual `try/catch` everywhere, so the v5 benefit is underutilized.

**2. `mongoose` v9.1.1**

MongoDB ODM. Provides schema validation, model abstraction, query building, middleware (pre/post hooks — not used here), compound indexes, and connection pooling. The `strict: false` on the `Applicant` model means Mongoose won't strip unknown fields.

**3. `express-session` v1.18.2**

Provides `req.session` for server-side session storage. Configured with a secret, `saveUninitialized: false`, and `secure: true` in production. However, the session is written on login but never read for route protection — the frontend uses `localStorage` instead.

**4. `nodemailer` v7.0.12**

Email delivery via Gmail SMTP. Used for four email flows: new application alert to admins, acceptance notification, rejection notification, and credential delivery. The `Promise.race` timeout pattern ensures email slowness doesn't block API responses.

**5. `nanoid` v3.3.11** (pinned to v3 specifically for CommonJS compatibility)

Generates cryptographically secure, URL-safe unique IDs. Used to generate the 10-character initial password for new franchisees: `nanoid(10)`. The choice of v3 is deliberate — v4+ is ESM-only and would break a CommonJS backend without additional config.

**6. `bcrypt` v6.0.0** *(added in latest update)*

Industry-standard password hashing library. Used via Mongoose pre-save hooks and `comparePassword` instance methods on both `Admin` and `FranchiseCredential` models. `bcrypt.genSalt(10)` generates a salt with a work factor of 10 (2^10 = 1024 rounds of hashing). `bcrypt.hash(password, salt)` produces a 60-character hash. `bcrypt.compare(candidatePassword, storedHash)` handles the salt extraction and comparison internally. Salt rounds of 10 is the accepted industry default — high enough to be slow for attackers, fast enough that legitimate logins don't feel sluggish (typically ~100ms).

**Frontend:**

**1. `react-router-dom` v7.11.0**

Client-side routing. `BrowserRouter`, `Routes`, `Route`, `Navigate`, `NavLink`, `useNavigate`, `useLocation` are all used. The nested `Routes` inside `AdminDashboard` and `FranchiseeDashboard` create sub-routing scopes.

**2. `axios` v1.13.2**

HTTP client. Used everywhere for API calls. Key features used: request/response interception isn't used, but `timeout` option is used on critical calls like `grantApplicant`. All requests are bare `axios.post()` calls with no centralized interceptor for auth headers.
 
**3. `recharts` v3.6.0**

Composable charting library built on D3. `BarChart`, `LineChart`, `ResponsiveContainer`, `XAxis`, `YAxis`, `Tooltip`, `Legend` are used in `SalesChart.jsx` and `SalesAnalysis.jsx`.

**4. `date-fns` v4.1.0**

Date utility library. Used in `SalesCalendar.jsx` for `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `format`, `isSameDay`, `isToday`, `isFuture`, `addMonths`, etc. Preferred over Moment.js for its tree-shaking and immutable function design.

**5. `lucide-react` v0.562.0**

Icon library used throughout the entire UI. Every icon is a React component (tree-shakeable). Used for sidebar nav icons, form icons, status indicators, and button icons.

---

## SECTION 3: SECURITY, STATE, & PERFORMANCE AUDIT

### Authentication & Session Architecture

**What the code actually does:**

1. User submits credentials to `POST /admin/login` or `POST /franchisee/login`
2. Controller does `Model.findOne({ email, password })` — direct plaintext comparison in the MongoDB query
3. On match, the controller sets `req.session.adminEmail` and `req.session.userType`
4. The response returns `{ stat: true }`
5. The React frontend stores `email` and `userType` in `localStorage`
6. **All subsequent "authentication" is checking `localStorage.getItem('userType')` in `useEffect`**

**The session is never used for route protection.** There is no middleware that checks `req.session` before controller execution. The session setup in `server.js` is essentially dead weight in terms of actual security.

**Route protection mechanism:**

```js
// AdminDashboard.jsx
useEffect(() => {
  const userType = localStorage.getItem('userType');
  if (userType !== 'admin') navigate('/login');
}, []);
```

This is client-side-only protection. Any API endpoint can be called directly by anyone — there is no server-side auth middleware guarding any route.

### Global State Management

The app uses **no global state library**. There is no Redux, no Zustand, no MobX, no React Context API for auth state.

**State is managed via:**

1. `localStorage` — persists `email` and `userType` across page refreshes, read directly in components
2. **Props drilling** — `AdminDashboard` fetches `applicants` and passes it down to `DashboardOverview`, `ApplicationsList`, and `FranchisesList` as props. `FranchiseeDashboard` fetches `profile` and `salesData` and passes them down.
3. **Local `useState`** — each component manages its own UI state (modals, loading, form data, etc.)

This means there's no reactive auth state — if `localStorage` is cleared, the UI won't reactively log out without a page refresh.

---

### Security & Architectural Weaknesses (Interviewer-Level Audit)

These are the exact issues a senior engineer would raise:

**~~CRITICAL — Plaintext Passwords~~ ✅ FIXED**

Previously, passwords were stored and compared in plaintext via `findOne({ email, password })`. This has been resolved. Both `Admin` and `FranchiseCredential` models now use `bcrypt` for password hashing via a Mongoose `pre('save')` hook and a `comparePassword` instance method. Login controllers now query only by `{ email }` and call `await model.comparePassword(password)` for verification. A database breach no longer exposes raw passwords.

```js
// BEFORE (fixed — no longer in codebase):
const admin = await Admin.findOne({ email, password }) // plaintext in DB query

// AFTER (current implementation):
const admin = await Admin.findOne({ email })
if (admin && await admin.comparePassword(password)) { ... }
```

**Remaining note:** The `changePassword` endpoint in `adminController.js` still uses the old `findOne({ email, password })` pattern for current-password verification and `Admin.updateOne` with a raw `newPassword` string — meaning the new password bypasses the pre-save hook and is stored unhashed. This is a residual bug introduced by an incomplete migration. The `franchiseeController.changePassword` was correctly updated to use `credential.comparePassword()` and `credential.save()` (which triggers the pre-save hook). The admin version needs the same treatment.

**CRITICAL — No Server-Side Route Protection**

All API routes are completely open. `POST /admin/grantApplicant` can be called by anyone with Postman. There is no middleware checking `req.session` or a JWT. Fix: add an auth middleware that checks session or verifies a JWT token before every protected route.

**CRITICAL — Inconsistent Auth Paradigm**

Sessions are configured and set on login but the frontend ignores them entirely. The two systems are in conflict. The cookie-based session requires `credentials: true` on CORS (which is set) but `localStorage` doesn't benefit from cookie security. Fix: pick one — either JWT (stateless) or sessions (stateful) and use it consistently.

**HIGH — localStorage Auth Token**

Storing `userType` in `localStorage` is vulnerable to XSS attacks — any injected script can read it. Sessions stored in `HttpOnly` cookies are not accessible to JavaScript. Fix: use `HttpOnly` session cookies and validate on the server.

**HIGH — Sequential Login API Calls**

`UnifiedLogin.jsx` fires the admin API first, and only if it fails fires the franchisee API. This means every franchisee login makes two HTTP requests. It also leaks information: if admin login returns a different error than franchisee login, an attacker can enumerate which type of account exists. Fix: a single `/auth/login` endpoint that checks both collections or knows which type to check.

**HIGH — No Input Validation/Sanitization on Backend**

No `joi`, `express-validator`, or manual validation exists in any controller beyond duplicate-email checks. Fields like `area_sqft` and `site_floor` are stored as Strings without validation. A malformed payload could cause Mongoose cast errors that leak stack traces.

**MEDIUM — `strict: false` on Applicant Schema**

```js
{ strict: false }
```

This tells Mongoose to save any field sent in the request body, even undeclared ones. Combined with no input validation, an attacker can write arbitrary data to the database.

**MEDIUM — Collection Name Typo**

```js
collection: 'franchise_credentails' // intentional typo
```

While harmless at runtime (MongoDB just uses the name as-is), this is a permanent tech debt. New developers won't know whether it's intentional without a comment. A comment exists in the code, which is good.

**MEDIUM — `area_sqft` Stored as String**

```js
area_sqft: String
```

Square footage is a numeric value being stored as a string. Arithmetic, sorting, and filtering on this field won't work as expected.

**MEDIUM — Missing Compound Index Awareness in `getSales`**

The compound index `{ email: 1, dos: 1 }` is well placed. But `getAllApplicants` has no index beyond `email` — sorting by `doa: -1` on a large collection without an index on `doa` will be slow.

**LOW — N+1 Email Loop in `submitApplication`**

```js
const admins = await Admin.find({}, 'email')
for (const admin of admins) {
  await emailService.sendNewApplicationNotification(admin.email, ...)
}
```

Emails are sent sequentially in a `for` loop with `await`, not in parallel with `Promise.all`. With 10 admins this takes 10× as long. Fix: `await Promise.all(admins.map(admin => emailService.send(...)))`.

**LOW — No Pagination on `getAllApplicants`**

`Applicant.find().lean().sort({ doa: -1 })` fetches every single document. With thousands of applicants, this loads the entire collection into memory on every dashboard load.

**LOW — `nanoid` v3 Pin for CJS**

The comment in the README doesn't mention this, but pinning to v3 is a silent dependency constraint. If someone runs `npm update` they'll break the CJS import. This should be documented.

---

## SECTION 4: EXHAUSTIVE QUESTIONS & ANSWERS

---

### Q1: Walk me through exactly how a user logs in and how the app knows they're authenticated on every subsequent page load.

**Senior-Level Answer:**

Login hits either `POST /admin/login` or `POST /franchisee/login`. On the backend, the controller does a `findOne({ email, password })` against the respective MongoDB collection — a direct plaintext comparison embedded in the query itself. If a document is returned, `req.session.adminEmail` and `req.session.userType` are set on the server-side session store, and `{ stat: true }` is returned.

On the frontend, the React component receives that `stat: true`, calls `localStorage.setItem('email', ...)` and `localStorage.setItem('userType', ...)`, then programmatically navigates to the dashboard using `useNavigate()`.

Every subsequent page load, the dashboard components (`AdminDashboard`, `FranchiseeDashboard`) run a `useEffect` on mount that reads `localStorage.getItem('userType')`. If it doesn't match the expected role, `navigate('/login')` is called. That's the entire auth guard. There are no protected API routes — the backend has no middleware that validates a session or token before processing any request. The session that was set on the server is never consulted again.

**Cheat Sheet:**
> Login → `findOne({ email })` → `comparePassword(password)` via bcrypt → session set (unused) → `localStorage` written → `useEffect` checks `localStorage` on page load — no server-side route guards exist.

---

### Q2: What is the most severe security vulnerability in this codebase and how would you fix it?

**Senior-Level Answer:**

The plaintext password vulnerability has been resolved in the latest update. Both `Admin` and `FranchiseCredential` models now use `bcrypt` via a Mongoose `pre('save')` hook:

```js
adminSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

The `!this.isModified('password')` guard is critical — it prevents the hook from re-hashing an already-hashed password every time any field on the document is saved (e.g., a profile update). Without this guard, saving `fname` would re-hash the existing hash, making the password permanently invalid.

Login controllers now use:
```js
const admin = await Admin.findOne({ email });
if (admin && await admin.comparePassword(password)) { ... }
```

The remaining most severe issue is **zero server-side route protection**. `POST /admin/grantApplicant` can still be called by any unauthenticated HTTP client. The fix is an Express middleware:

```js
function requireAdminAuth(req, res, next) {
  if (!req.session || req.session.userType !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
router.post('/grantApplicant', requireAdminAuth, adminController.grantApplicant);
```

**Cheat Sheet:**
> Plaintext passwords ✅ fixed with bcrypt pre-save hook + `comparePassword` instance method. `isModified('password')` guard prevents double-hashing. Biggest remaining issue: zero server-side auth middleware — all routes still open to unauthenticated requests.

---

### Q3: Explain the application status lifecycle. What transitions are possible and what happens at each stage?

**Senior-Level Answer:**

The `Applicant.status` field follows a linear state machine with four values:

```
pending → accepted → granted
        ↘          ↗
         rejected
```

1. **`pending`** — Set on creation in `applicantController.submitApplication`. The admin sees Accept and Reject buttons.

2. **`accepted`** — Set by `adminController.acceptApplicant` via `Applicant.updateOne({ email }, { $set: { status: 'accepted' } })`. A notification email is sent fire-and-forget. The admin now sees Grant and Reject buttons.

3. **`granted`** — Set by `adminController.grantApplicant`. This is the most complex transition: status changes to `'granted'`, a `FranchiseCredential` document is created with a `nanoid(10)` password, and login credentials are emailed to the franchisee. The UI shows credentials in a modal as a backup if email fails. Once granted, no further actions are shown in the UI.

4. **`rejected`** — Can happen from either `pending` or `accepted`. Sets status to `'rejected'`, sends rejection email. Terminal state in the UI.

**Cheat Sheet:**
> pending → accepted (Accept btn, email sent) → granted (Grant btn, credential created, nanoid password, email sent) | rejected (Reject btn, email sent, terminal). `strict: false` means the schema doesn't enforce these values — any string can be stored.

---

### Q4: How does the `grantApplicant` flow handle the case where credentials already exist?

**Senior-Level Answer:**

The controller checks for an existing `FranchiseCredential` before creating one:

```js
let credential = await FranchiseCredential.findOne({ email });
if (!credential) {
  password = nanoid(10);
  credential = new FranchiseCredential({ email, password, dof: new Date() });
  await credential.save();
} else {
  password = credential.password; // Reuse existing
}
```

This is an idempotency guard — if `grantApplicant` is called twice (e.g., double-click, retry), the second call reuses the existing password rather than creating a duplicate. The applicant status is set to `'granted'` both times (harmless), and the same password is returned and emailed again. This is a reasonable defensive pattern, though a proper idempotency key mechanism would be cleaner.

**Cheat Sheet:**
> `findOne` before `new FranchiseCredential` — idempotent credential creation. Double-grant reuses existing password. Status update is also idempotent.

---

### Q5: Why does `SalesData` use a compound index on `{ email: 1, dos: 1 }` and what queries does it optimize?

**Senior-Level Answer:**

The primary query patterns against `SalesData` are:

```js
// getSales
SalesData.find({ email, dos: { $gte: startDate, $lte: endDate } })
// addSales — duplicate check
SalesData.findOne({ email, dos: salesDate })
```

Both queries filter first on `email` then on `dos`. A compound index `{ email: 1, dos: 1 }` allows MongoDB to use an index range scan: it jumps directly to the B-tree node for a specific email, then scans only the date range within that partition. Without it, MongoDB would do a collection scan across all franchisees' sales records.

The `email: 1` field is also declared as a single-field index (`index: true` in the schema). This creates a redundant index because a compound index with `email` as the leading key already covers single-email queries. The single-field index wastes write overhead. A senior engineer would drop the single-field `email` index and keep only the compound one.

**Cheat Sheet:**
> Compound index `{ email: 1, dos: 1 }` → enables index range scan for date-filtered queries per franchisee. Single-field `email` index is redundant and should be removed. Sort `{ dos: -1 }` is covered by the compound index if reversed.

---

### Q6: Explain the `TodaysSales` date logic. Why does it allow entries for the previous month during the first week?

**Senior-Level Answer:**

`TodaysSales` implements a business rule: franchisees sometimes forget to enter the last days of a previous month. The `getDateRange()` function checks:

```js
if (currentDay <= 7) {
  // First week: min date is first of previous month
  minDate = new Date(currentYear, currentMonth - 1, 1);
} else {
  // Rest of month: min date is first of current month
  minDate = new Date(currentYear, currentMonth, 1);
}
```

It also handles the January edge case (month 0 → go to December of previous year).

The UI then generates a dropdown of only the dates within this range that do NOT already have sales entries. After submission, the component re-fetches existing sales and regenerates the dropdown — removing the date just submitted. This is a UX optimization to prevent duplicate entry confusion (the DB also has a `findOne` check on the backend).

The date handling uses **local timezone JavaScript Date methods** (`getFullYear()`, `getMonth()`, `getDate()`) rather than UTC methods to avoid off-by-one errors for users in IST (UTC+5:30), where a UTC midnight is the previous day.

**Cheat Sheet:**
> First 7 days of month → allow previous month entry. Uses local Date methods (not UTC) to avoid IST timezone shift issues. Dropdown shows only dates without existing entries, regenerated after each submit.

---

### Q7: How does the email system work and what happens if an email fails?

**Senior-Level Answer:**

`utils/emailService.js` creates a single Nodemailer transporter using Gmail SMTP configured from `process.env.EMAIL_USER` and `process.env.EMAIL_PASS`. It exports four functions, each building an HTML template and calling `transporter.sendMail()`.

The key architectural decision is **fire-and-forget with timeout protection** using `Promise.race`:

```js
Promise.race([
  emailService.sendFranchiseCredentials(email, name, email, password),
  new Promise((resolve) => setTimeout(() => resolve({ success: false }), 5000))
]).then(result => { /* log only */ })
```

The API response is sent immediately **before** the email resolves. This prevents SMTP timeouts (Gmail can take 5-10s) from blocking the user-facing operation. The `Promise.race` ensures if email takes more than 5 seconds, the timeout wins and the credential is considered "failed to send."

The UI handles this gracefully: `SuccessModal` always shows the credentials in the modal as a fallback. Even if email fails, the admin can manually copy and share the password. `emailSent: true` is returned regardless — it's an optimistic assumption. This is a pragmatic but imperfect design.

**Cheat Sheet:**
> Gmail SMTP via Nodemailer. `Promise.race(emailPromise, 5s timeout)` → API responds immediately, email failure doesn't block UX. Credentials shown in modal as backup. `emailSent: true` is optimistic.

---

### Q8: What design pattern does `UnifiedLogin` implement, and what is its performance and security problem?

**Senior-Level Answer:**

`UnifiedLogin` implements a **"try-first" sequential fallback** pattern — it doesn't know which role the user is before attempting login. It hits `POST /admin/login` first, and only if `stat: false` does it fall through to `POST /franchisee/login`.

**Performance problem:** Every franchisee login (the majority of users) results in two sequential HTTP requests. The first is a guaranteed wasted trip that adds latency equal to one full round-trip to the backend plus one MongoDB query.

**Security problem (user enumeration):** The admin login endpoint returns a different response timing — if an admin email exists and the password is wrong vs. a completely unknown email, timing differences could be measured. More directly, if the error messages differ between "admin not found" and "wrong password," user type and existence can be enumerated.

**Better design:** A single `POST /auth/login` endpoint that accepts email+password, determines the user type by checking both collections (or a unified users collection), and returns a typed response.

**Cheat Sheet:**
> Sequential double-call (admin first, franchisee second) → 2x latency for franchisees. Security: timing side-channel and potential user enumeration. Fix: unified `/auth/login` endpoint.

---

### Q9: How does the `SalesCalendar` component work? What libraries does it use and how does it color-code dates?

**Senior-Level Answer:**

`SalesCalendar` uses `date-fns` to generate the full calendar grid:

```js
const monthStart = startOfMonth(currentMonth)
const calendarStart = startOfWeek(monthStart)  // Includes padding from previous month
const calendarEnd = endOfWeek(endOfMonth(currentMonth))
const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
```

This generates ~35–42 day objects regardless of month length, creating a 7-column grid.

On `useEffect` (triggered on month change), it fetches all sales for the displayed month via `POST /franchisee/getSales` and stores the resulting date strings in a `Set` for O(1) lookup.

**Color-coding logic in `getDayColor()`:**

| Condition | Color | Meaning |
|---|---|---|
| `isFuture(day)` | Gray, disabled | Can't add future sales |
| `isToday(day)` | Blue with ring | Today (with or without data) |
| `salesDates.has(dateStr)` | Green | Sales already entered |
| `canAddData(day)` and no data | Red border | Clickable — add sales |
| Past and not editable | Gray, opacity 50% | Outside allowed window |

Clicking a green date navigates to `/franchisee/history` with the date in router state. Clicking a red date navigates to `/franchisee/today` with the date pre-filled via router state: `navigate('/franchisee/today', { state: { selectedDate: dateStr } })`.

**Cheat Sheet:**
> `date-fns` generates grid via `eachDayOfInterval`. Sales dates stored in a `Set` for O(1) lookup. Green = has data (→ history). Red = missing (→ add sales). Blue = today. Gray = future/locked. State passed between routes via React Router `location.state`.

---

### Q10: How is data passed between the `SalesCalendar` and `TodaysSales` components?

**Senior-Level Answer:**

The data flows through React Router's location state rather than props or global state. When a user clicks a red (missing-data) date in `SalesCalendar`:

```js
navigate('/franchisee/today', { state: { selectedDate: dateStr } })
```

In `TodaysSales`, the component reads this via the `useLocation` hook:

```js
const location = useLocation()
const initialDate = location.state?.selectedDate || today
const [formData, setFormData] = useState({ dos: initialDate, ... })
```

A `useEffect` also watches for `location.state?.selectedDate` changes and updates the form date reactively. The available-dates dropdown then either includes this date (if no sales yet) or the component auto-selects the next available date.

This is a clean pattern for cross-route UI communication without lifting state to a common ancestor. The tradeoff is that `location.state` is volatile — it disappears on page refresh and is not persisted.

**Cheat Sheet:**
> `navigate('/franchisee/today', { state: { selectedDate } })` → `useLocation().state?.selectedDate` in `TodaysSales`. Router state is volatile (lost on refresh). Pattern avoids prop-drilling through parent.

---

### Q11: Explain how Docker and Docker Compose are configured in this project.

**Senior-Level Answer:**

The project uses a two-service Docker Compose setup defined in `docker-compose.yml`:

```yaml
services:
  api:
    build: ./backend
    ports: ["2016:2016"]
    env_file: ./backend/.env
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [api]
```

Both services share a `mern-app-network` bridge network, allowing them to communicate by service name (e.g., `http://api:2016`).

**Backend Dockerfile** uses `node:20-alpine`, runs `npm ci --only=production` to skip dev dependencies, exposes port 2016, runs `npm start`.

**Frontend Dockerfile** is a multi-stage build:
- Stage 1: `node:20-alpine` as builder — installs all deps including devDeps, runs `npm run build` (Vite), produces `dist/`
- Stage 2: `node:20-alpine` — installs `serve` globally, copies only the `dist/` folder, serves on port 80

The `VITE_API_URL` is injected as a build argument:
```yaml
args:
  VITE_API_URL: http://localhost:2016
```

This is important: Vite bakes `VITE_*` env vars into the JavaScript bundle at build time. The value `http://localhost:2016` works for the Docker Compose local setup but would need to be `http://api:2016` for container-to-container communication, or a public URL for production deployment. This is a configuration inconsistency worth calling out.

**Cheat Sheet:**
> Two services: `api` (node:20-alpine, port 2016) + `frontend` (multi-stage Vite build, served by `serve`, port 80). `VITE_API_URL` is a build-time baked value — changing it requires a rebuild. Shared bridge network.

---

### Q12: What is `lean()` in Mongoose and why is it used in `getAllApplicants`?

**Senior-Level Answer:**

```js
const applicants = await Applicant.find().lean().sort({ doa: -1 });
```

By default, Mongoose `find()` returns **Mongoose Document objects** — full instances with prototype methods like `.save()`, `.toObject()`, change tracking, and virtuals. These are heavier objects.

`.lean()` tells Mongoose to return **plain JavaScript objects** (POJOs) instead. This skips instantiating Document instances, which is significantly faster and uses less memory — benchmarks typically show 2–5× performance improvement on large result sets.

The tradeoff: lean documents don't have `.save()`, `.populate()`, or virtual fields. Since `getAllApplicants` only reads data and sends it directly to the frontend as JSON, lean is appropriate here. Wherever the result needs to be mutated and saved back (like in `acceptApplicant` using `updateOne`), lean isn't used.

**Cheat Sheet:**
> `.lean()` returns plain JS objects instead of Mongoose Document instances. Faster + less memory. Can't call `.save()` on lean results. Used in read-only fetches. Not used where the document needs to be modified in-place.

---

### Q13: How does the `addSales` endpoint handle duplicate entries for the same date?

**Senior-Level Answer:**

The controller implements a manual upsert pattern:

```js
const salesDate = new Date(dos);
salesDate.setHours(0, 0, 0, 0);

const existing = await SalesData.findOne({ email, dos: salesDate });

if (existing) {
  existing.sale = sale;
  existing.customers = customers;
  existing.orders = orders || 0;
  existing.items_sold = items_sold || 0;
  await existing.save();
  return res.json({ stat: true, msg: 'Sales updated' });
}

const salesData = new SalesData({ email, dos: salesDate, ... });
await salesData.save();
res.json({ stat: true, msg: 'Sales added' });
```

This is effectively `findOrCreate` with an update path. The date is normalized to midnight (`setHours(0,0,0,0)`) before the lookup to ensure the compound index `{ email: 1, dos: 1 }` matches correctly regardless of what time component was on the incoming `dos` string.

A cleaner implementation would use MongoDB's native `findOneAndUpdate` with `upsert: true`:
```js
await SalesData.findOneAndUpdate(
  { email, dos: salesDate },
  { $set: { sale, customers, orders, items_sold } },
  { upsert: true, new: true }
)
```
This reduces two DB roundtrips to one. The current approach uses two: a `findOne` and then either `save()` on an existing doc or `save()` on a new one.

**Cheat Sheet:**
> Manual upsert: `findOne` → update existing or create new. Date normalized to midnight for index match. Could be replaced with `findOneAndUpdate(..., { upsert: true })` to save one DB roundtrip.

---

### Q14: How does the `SalesAnalysis` period comparison feature work technically?

**Senior-Level Answer:**

When the user sets two date ranges and clicks "Compare Periods," `fetchComparisonData()` fires **two simultaneous API calls** using `Promise.all`:

```js
const [response1, response2] = await Promise.all([
  axios.post(`${API_BASE_URL}/franchisee/getSales`, {
    email,
    start: new Date(comparisonRange1.start).toISOString(),
    end: new Date(comparisonRange1.end).toISOString()
  }),
  axios.post(`${API_BASE_URL}/franchisee/getSales`, {
    email,
    start: new Date(comparisonRange2.start).toISOString(),
    end: new Date(comparisonRange2.end).toISOString()
  })
]);
```

`Promise.all` fires both requests concurrently. Both responses arrive (total time = max of the two, not sum), and then the component calculates:

```js
const total1 = data1.reduce((sum, d) => sum + (d.sale || 0), 0)
const avg1 = data1.length > 0 ? total1 / data1.length : 0
difference.percentage = total1 > 0 ? ((total2 - total1) / total1 * 100).toFixed(2) : 0
```

The result is stored in `comparisonData` state and rendered by the `PeriodComparison` component. The `PeriodComparison.jsx` is a pure presentational component — it only takes `comparisonData` as a prop and renders it, with no logic of its own.

**Cheat Sheet:**
> `Promise.all` fires two `getSales` calls concurrently (not sequentially). Client-side aggregation: total, avg, diff, percentage. `PeriodComparison` is pure presentational. Division-by-zero guard: `total1 > 0` before percentage calc.

---

### Q15: What are the CORS settings in `server.js` and why might they be a problem in production?

**Senior-Level Answer:**

The CORS configuration uses a dynamic `origin` function:

```js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  process.env.FRONTEND_URL,
  'https://franchiseehub.netlify.app'
].filter(Boolean);

origin: function(origin, callback) {
  if (!origin) return callback(null, true);       // Allow no-origin (Postman, curl)
  if (origin.includes('.netlify.app')) return callback(null, true);  // Any Netlify subdomain
  if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
  if (process.env.NODE_ENV === 'production') {
    console.log('Allowing request in production mode');
    callback(null, true);  // Allow everything in production — SECURITY FLAW
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

**The production bypass is a security flaw.** In production, if an origin is not in the allowlist, the code logs a warning but allows the request anyway. This completely negates CORS as a protection layer. An attacker can make cross-origin requests from any domain and they'll be allowed. The correct behavior is to reject unknown origins in production, not be more permissive.

Additionally, allowing all `.netlify.app` subdomains means any Netlify deployment by anyone can make cross-origin requests to this API.

**Cheat Sheet:**
> Dynamic origin function. Four localhost ports + `FRONTEND_URL` + hardcoded Netlify URL. Any `.netlify.app` subdomain allowed. **Production mode bypasses all CORS checks** — allows all origins. Should be reversed: strict in production, permissive in dev.

---

### Q16: How does the `netlify.toml` configuration make this a proper SPA deployment?

**Senior-Level Answer:**

The critical section is:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

React Router uses the HTML5 History API to change the URL without a server request. When a user directly navigates to `https://franchiseehub.netlify.app/franchisee/calendar`, the browser asks Netlify's CDN for `/franchisee/calendar`. Without the redirect rule, Netlify would return a 404 because that file doesn't exist in the `dist/` folder. With `status = 200`, Netlify serves `index.html` for any path, and React Router takes over client-side to render the correct component.

The file also sets production security headers:

```toml
X-Frame-Options = "DENY"           # Prevents clickjacking
X-Content-Type-Options = "nosniff" # Prevents MIME sniffing
X-XSS-Protection = "1; mode=block" # Legacy XSS filter (modern browsers ignore)
Referrer-Policy = "strict-origin-when-cross-origin"
Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

And aggressive asset caching for the Vite-built hashed filenames:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Cheat Sheet:**
> `/* → /index.html (200)` is the SPA redirect that makes direct URL navigation work. Security headers prevent clickjacking and MIME sniffing. Assets cached for 1 year (safe because Vite uses content-hashed filenames).

---

### Q17: What does `strict: false` on the Applicant schema actually do, and when would it cause a problem?

**Senior-Level Answer:**

Mongoose's `strict` option (default `true`) means: if you try to save a field that isn't declared in the schema, Mongoose silently strips it. With `strict: false`, Mongoose saves any field in the document, even undeclared ones.

```js
// strict: false means this saves successfully:
const applicant = new Applicant({
  fname: 'John',
  email: 'john@test.com',
  arbitraryField: 'whatever',  // Not in schema, but saved anyway
  __proto__: 'attack'          // Potentially dangerous
})
```

**When it causes problems:**
1. **Data integrity** — typos in field names from the frontend are silently saved rather than rejected. A field sent as `busines_name` instead of `buis_name` would create a new field in the document.
2. **Prototype pollution risk** — crafted payloads with `__proto__` or `constructor` fields could reach the database.
3. **Schema drift** — over time, production documents accumulate undeclared fields making the schema unreliable as documentation.

The likely reason for `strict: false` here is to handle the backwards-compatibility scenario where the database already had documents with extra fields before the schema was tightened.

**Cheat Sheet:**
> `strict: false` → Mongoose saves undeclared fields. Risks: data integrity (typos saved), schema drift, prototype pollution. Likely added for backwards compat with existing DB documents. Should be removed and schema updated to match all real fields.

---

### Q18: Why is `nanoid` pinned to version 3 and what breaks if you upgrade to v4?

**Senior-Level Answer:**

`nanoid` v4 switched to an **ESM-only** package — it no longer ships a CommonJS build. The backend uses `"type": "commonjs"` in `package.json` and uses `require()` throughout:

```js
const { nanoid } = require('nanoid')
```

If you run `npm install nanoid@latest` (v4+), this `require()` call throws:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../nanoid/index.js not supported.
```

The fix options are:
1. Stay on v3 (current approach — implicit)
2. Use a dynamic `import()`: `const { nanoid } = await import('nanoid')` — requires making the function async
3. Convert the entire backend to ESM (`"type": "module"`) and change all `require()` to `import`
4. Use an alternative like `crypto.randomBytes(10).toString('base64url')` from Node's built-in `crypto` module, which needs no external dependency

The fact that v3 is used without a comment in `package.json` is a hidden maintenance trap. A `package.json` comment (not possible in JSON, but a note in README or `.nvmrc`) or pinning it with a `//` in lockfile comments would help.

**Cheat Sheet:**
> nanoid v4+ is ESM-only, breaks `require()`. Backend is CommonJS. Pinned to v3 for CJS compat. Fix: use `crypto.randomBytes` (no dependency), dynamic `import()`, or convert backend to ESM.

---

### Q19: How would you add proper JWT-based authentication to this codebase?

**Senior-Level Answer:**

The migration would have three parts now — password hashing is already done.

**1. Install JWT:**
```bash
npm install jsonwebtoken
```
`bcrypt` is already installed and the models already have `pre('save')` hooks and `comparePassword` methods on both `Admin` and `FranchiseCredential`.

**2. Update login controllers** — verify hash (already done), issue token:
```js
const admin = await Admin.findOne({ email })
if (!admin || !(await admin.comparePassword(password))) {
  return res.json({ stat: false, msg: 'Invalid credentials' })
}

const token = jwt.sign(
  { email: admin.email, userType: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)
res.json({ stat: true, token })
```

**3. Add auth middleware** — protect routes:
```js
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

**4. Frontend** — store token in memory or `sessionStorage` (not `localStorage` for XSS safety), send in `Authorization: Bearer <token>` header via an Axios interceptor:
```js
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

**Cheat Sheet:**
> bcrypt already done ✅. Remaining steps: install `jsonwebtoken`, sign JWT on login, verify JWT in middleware. Frontend: Axios request interceptor adds `Authorization: Bearer` header. Store token in `sessionStorage` not `localStorage`.

---

### Q20: If you had to add pagination to `getAllApplicants`, how would you implement it?

**Senior-Level Answer:**

**Backend change** — accept `page` and `limit` query params:

```js
exports.getAllApplicants = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const [applicants, total] = await Promise.all([
    Applicant.find().lean().sort({ doa: -1 }).skip(skip).limit(limit),
    Applicant.countDocuments()
  ])

  res.json({
    status: true,
    doc: applicants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  })
}
```

**Frontend change** — `AdminDashboard` tracks current page, passes it to `fetchApplicants`, and updates when page changes. The `ApplicationsList` and `DashboardOverview` components would need to receive and display pagination controls.

The `countDocuments()` + `find().skip().limit()` pattern requires two DB calls. An alternative is cursor-based pagination using the last document's `_id` as a cursor (`{ _id: { $lt: lastId } }`), which is faster for large datasets but harder to implement with arbitrary page jumping.

**Cheat Sheet:**
> `find().skip((page-1)*limit).limit(limit)` + `countDocuments()` in `Promise.all`. Return pagination metadata. Cursor-based pagination (`_id: { $lt: lastId }`) is faster for large sets but doesn't support random page access.

---

*End of FranchiseeHub Interview Blueprint*

*Document covers: Backend MVC architecture, Frontend SPA architecture, full data flow traces (application submission, franchisee login), all four Mongoose models with relationships, directory structure, top 10 dependencies, authentication audit, state management analysis, 12 identified security/performance weaknesses, and 20 exhaustive senior-level Q&A with cheat sheets.*


---

## SECTION 5: CHALLENGES FACED & HOW THEY WERE SOLVED

---

### Challenge 1: Email Delivery Blocking API Responses

**The Problem:**
The first version of the `grantApplicant` and `acceptApplicant` flows used `await` directly on the email send calls. Gmail SMTP can take anywhere from 3 to 10 seconds to respond. This meant the entire API request was held open waiting for an email to send. On slower connections or when Gmail was throttling, the frontend would show a loading spinner for 8–10 seconds, and in some cases the request would time out entirely — returning an error to the admin even though the database operation had already succeeded. The franchisee status was correctly updated in MongoDB but the admin saw a failure screen.

**How It Was Solved:**
The email calls were refactored to use `Promise.race` with a hard 5-second timeout:

```js
Promise.race([
  emailService.sendFranchiseCredentials(email, name, email, password),
  new Promise((resolve) => setTimeout(() => resolve({ success: false, error: 'Email timeout' }), 5000))
]).then(emailResult => {
  if (emailResult.success) {
    console.log(`📧 Credentials email sent successfully to ${email}`);
  } else {
    console.error(`❌ Failed to send email to ${email}:`, emailResult.error);
  }
}).catch(err => {
  console.error(`❌ Email error for ${email}:`, err);
});

// Return success immediately — don't wait for email
res.json({ stat: true, msg: 'Franchise granted successfully', password, email });
```

The `res.json()` is now called before the email Promise resolves. The API responds in under 100ms regardless of email speed. As a second layer of safety, the `SuccessModal` on the frontend always displays the generated credentials visually so the admin can manually copy and share them even if the email never arrives.

---

### Challenge 2: Timezone Issues with Date Storage and Display

**The Problem:**
Sales data stores dates as MongoDB `Date` objects, which are always stored in UTC. Indian users (IST = UTC+5:30) were experiencing a systematic off-by-one error. When a franchisee entered sales for June 15th, the date was being stored as June 14th 18:30:00 UTC (because `new Date('2024-06-15')` in a browser creates a UTC midnight, but Node.js `new Date(dos)` without explicit timezone handling created a UTC date that when viewed locally appeared to be the previous day). The calendar component was showing green dots on the wrong dates, and the dropdown in `TodaysSales` was listing dates that already had entries as still available.

**How It Was Solved:**
The fix was applied at two layers. On the backend, dates are explicitly normalized to local midnight using `setHours(0, 0, 0, 0)` before any DB query or insert:

```js
const salesDate = new Date(dos);
salesDate.setHours(0, 0, 0, 0);
const existing = await SalesData.findOne({ email, dos: salesDate });
```

On the frontend, the `TodaysSales` component stopped using UTC-based `.toISOString().split('T')[0]` for date comparisons and switched to local timezone methods:

```js
const year = saleDate.getFullYear();
const month = String(saleDate.getMonth() + 1).padStart(2, '0');
const day = String(saleDate.getDate()).padStart(2, '0');
return `${year}-${month}-${day}`;
```

This ensures the date string always reflects what the user's local calendar shows, not what UTC thinks the date is.

---

### Challenge 3: The "Grant" Action Timing Out on Slow Connections

**The Problem:**
The `grantApplicant` flow does several things: it updates the applicant status, checks for existing credentials, potentially creates a new `FranchiseCredential` document, generates a `nanoid` password, and sends an email. On the Render.com free tier (where the backend is hosted), cold starts mean the server can be sleeping. The first request after inactivity would wake the server, connect to MongoDB Atlas (another network hop), and attempt an email send — all in one synchronous chain. The frontend Axios call was timing out at the default threshold, showing an error to the admin even when the database operations had actually completed.

**How It Was Solved:**
A custom `timeout` option was added specifically to the grant Axios call on the frontend:

```js
const response = await axios.post(
  `${API_BASE_URL}/admin/grantApplicant`,
  { email },
  { timeout: 15000 } // 15 second timeout for this specific call
);
```

The backend was also refactored so that the `res.json()` response is sent as soon as the DB operations complete, with the email running in the background. This way even if the total server processing takes 12 seconds, the frontend gets a response well within the 15-second window. Error handling on the frontend was also made more specific — distinguishing between `error.code === 'ECONNABORTED'` (timeout) and actual server errors, showing different messages to the admin accordingly.

---

### Challenge 4: Duplicate Sales Entry Prevention

**The Problem:**
The initial implementation had no guard against a franchisee submitting sales for the same date twice. If a user accidentally double-submitted the form, or navigated back and resubmitted, two `SalesData` documents would be created for the same `(email, dos)` combination. This corrupted analytics — totals would be doubled, charts would show two bars for the same date, and the calendar would still show the date as missing because the lookup wasn't working correctly.

**How It Was Solved:**
A two-layer solution was implemented. On the backend, the `addSales` controller does a `findOne` check before creating a new document — if a record exists for that email and date, it updates the existing one rather than creating a duplicate:

```js
const existing = await SalesData.findOne({ email, dos: salesDate });
if (existing) {
  existing.sale = sale;
  existing.customers = customers;
  existing.orders = orders || 0;
  existing.items_sold = items_sold || 0;
  await existing.save();
  return res.json({ stat: true, msg: 'Sales updated' });
}
```

On the frontend, `TodaysSales` generates a dropdown of only the dates that do NOT already have sales entries. After every successful submission, it re-fetches existing sales from the backend and regenerates the available dates list — automatically removing the date just entered. This means the UI physically cannot let a user select a date that already has data.

---

### Challenge 5: React Router SPA Routing on Netlify

**The Problem:**
After deploying the frontend to Netlify, direct navigation to any nested route like `https://franchiseehub.netlify.app/franchisee/calendar` returned a 404 error. The same happened when a user refreshed the page while on any route other than `/`. This is the classic SPA deployment problem — Netlify's CDN looks for a physical file at that path, finds nothing, and returns 404. React Router only works for in-app navigation, not for URLs that hit the server directly.

**How It Was Solved:**
A `netlify.toml` configuration file was added with a catch-all redirect rule:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The `status = 200` is critical — it tells Netlify to serve `index.html` as if it were the correct response for any path, without changing the URL in the browser. React Router then reads the current URL and renders the correct component client-side. A `public/_redirects` file with the same rule was also added as a fallback for older Netlify configurations.

---

### Challenge 6: Keeping the Admin UI Responsive During Long Operations

**The Problem:**
Actions like accepting, rejecting, and granting applications required disabling the entire table while the request was in flight. The initial implementation used a single `loading` boolean that disabled all buttons across all rows simultaneously. When an admin had 50 applications visible and clicked Accept on one, every single button in the table would grey out — making the UI feel broken and preventing the admin from performing any other action while waiting.

**How It Was Solved:**
The flow was redesigned to use a two-modal confirmation pattern. Instead of acting directly on button click, the action button opens a `ConfirmModal` that captures the intent (`action`, `email`, `name`). The actual API call only happens when the admin clicks Confirm inside the modal. During that API call, only the modal's buttons are disabled — the rest of the table remains fully interactive. After the operation completes, a `SuccessModal` shows the result. This also added a confirmation step that prevents accidental clicks on destructive actions like Reject.

---

### Challenge 7: Building a Calendar Without a Heavy Library

**The Problem:**
The initial approach was to use a full calendar library like `react-big-calendar` or `fullcalendar`. These libraries are 200–500KB and come with opinionated styling that was difficult to override with Tailwind CSS. They also didn't support the specific interaction model needed: color-coding dates based on sales data and navigating to different routes on date click.

**How It Was Solved:**
The calendar was built from scratch using `date-fns` utility functions, which are individually tree-shakeable and add only the bytes actually used. The grid is a plain CSS `grid grid-cols-7` div. `date-fns` functions like `startOfMonth`, `endOfMonth`, `startOfWeek`, `endOfWeek`, and `eachDayOfInterval` generate the exact array of day objects needed to fill a 7-column calendar grid including padding from the previous and next months. The color logic is a simple `getDayColor()` function that checks four conditions in order. The result is a fully custom calendar that weighs almost nothing and integrates naturally with Tailwind.

---

### Challenge 8: Managing Cross-Environment API URLs

**The Problem:**
The project needed to work in three different environments: local development (`localhost:2016`), Docker Compose (where the backend service name is `api`), and production (Render.com URL). Hardcoding any URL would break at least two of the three environments. Early versions had the API URL hardcoded directly in component files, which required manual find-and-replace before every deployment.

**How It Was Solved:**
A centralized `src/config/api.js` file was created that reads `import.meta.env.VITE_API_URL` and applies a fallback chain:

```js
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) return 'https://franchiseehub-backend.onrender.com';
  return 'http://localhost:2016';
};
```

Three separate `.env` files handle each environment: `.env.development` for local dev, `.env.production` for Netlify builds, and the Docker Compose `args.VITE_API_URL` build argument for containerized deployments. Every component imports from this single config file, so changing the URL in one place updates the entire app.

---

## SECTION 6: CURRENT FLAWS IN THE CODEBASE

---

### ~~Flaw 1: Passwords Were Stored and Compared in Plaintext~~ ✅ RESOLVED

**Previous Severity: Critical — Now Fixed**

This flaw has been resolved in the latest update. Both `Admin` and `FranchiseCredential` models now implement bcrypt hashing through a Mongoose `pre('save')` hook and a `comparePassword` instance method. Passwords are no longer stored as raw strings, and login queries no longer embed the password as a search criterion.

```js
// Admin.js and FranchiseCredential.js — current implementation
const bcrypt = require('bcrypt');

schema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

schema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

Login controllers now use `findOne({ email })` followed by `await model.comparePassword(password)`.

---

### Flaw 1b: Admin `changePassword` Still Uses Plaintext Comparison and Bypasses bcrypt Hook

**Severity: Critical (Residual Bug from Incomplete Migration)**

While the franchisee `changePassword` was correctly updated to use `comparePassword` and `credential.save()` (which triggers the pre-save bcrypt hook), the admin `changePassword` endpoint was not fully migrated:

```js
// adminController.js — changePassword (CURRENT — STILL BROKEN)
const admin = await Admin.findOne({ email, password: currentPassword }); // plaintext search
if (!admin) {
  return res.json({ stat: false, msg: 'Current password is incorrect' });
}
await Admin.updateOne(
  { email },
  { $set: { password: newPassword } } // bypasses pre-save hook — stores plaintext
);
```

This means:
1. The current password verification sends the raw password into a MongoDB query — which will always fail now because the stored value is a bcrypt hash, not the original string. Admin password changes are currently **completely broken**.
2. Even if the comparison were fixed, `Admin.updateOne()` with `$set` bypasses Mongoose middleware entirely — the pre-save hook never fires, so `newPassword` would be stored as plaintext.

**The correct implementation** (matching how `franchiseeController.changePassword` was fixed):

```js
exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin || !(await admin.comparePassword(currentPassword))) {
    return res.json({ stat: false, msg: 'Current password is incorrect' });
  }

  admin.password = newPassword; // triggers pre-save hook on .save()
  await admin.save();

  res.json({ stat: true, msg: 'Password changed successfully' });
};
```

---

### Flaw 2: Zero Server-Side Route Protection

**Severity: Critical**

Not a single API route has an authentication middleware. The most destructive endpoint in the system — `POST /admin/grantApplicant` — which creates franchise credentials and permanently changes application status — can be called by any unauthenticated HTTP client with a single curl command:

```bash
curl -X POST https://franchiseehub-backend.onrender.com/admin/grantApplicant \
  -H "Content-Type: application/json" \
  -d '{"email": "victim@example.com"}'
```

This would grant a franchise to any email address without any admin involvement. Similarly, `POST /admin/rejectApplicant` can reject any application from anywhere on the internet.

**What it should be:** An `authenticate` middleware applied to all non-public routes that verifies `req.session.userType` or a JWT token before the controller is reached.

---

### Flaw 3: Conflicting and Broken Authentication Architecture

**Severity: Critical**

The backend configures `express-session` and sets session variables on login:
```js
req.session.adminEmail = email;
req.session.userType = 'admin';
```

But the frontend completely ignores the session. All authentication decisions are made by reading `localStorage.getItem('userType')` — a client-controlled value that any user can set to `'admin'` in their browser console and gain access to the admin UI (though without server-side protection this doesn't matter anyway). The session and the localStorage mechanism are two separate systems that don't talk to each other. One is set up and never used. The other is used but provides no real security.

---

### Flaw 4: CORS in Production Allows All Origins

**Severity: High**

The CORS configuration has a production bypass:

```js
if (process.env.NODE_ENV === 'production') {
  console.log('Allowing request in production mode');
  callback(null, true); // Allows ALL origins
}
```

This means in the deployed production environment, cross-origin requests from any website on the internet are accepted. CORS is supposed to be more restrictive in production, not less. Combined with the lack of server-side auth, this means any website can make authenticated-looking requests to the production API.

---

### Flaw 5: No Input Validation or Sanitization on the Backend

**Severity: High**

No controller validates incoming request body fields. There is no `joi` schema validation, no `express-validator` middleware, and no manual length/type checking beyond the Mongoose schema types. This creates several problems:

- A `sale` value of `-9999999` or `NaN` would be stored without rejection
- An `email` field with 10,000 characters would be accepted and stored
- The `Applicant` schema has `strict: false`, meaning completely arbitrary fields sent in the request body are saved to the database
- Mongoose type cast errors (e.g., sending a string where a Number is expected) produce verbose error stack traces that are returned in the `500` response body, leaking internal implementation details

---

### Flaw 6: N+1 Problem in Admin Email Notifications

**Severity: Medium**

When a new franchise application is submitted, the controller fetches all admin email addresses and then sends notification emails in a sequential `for` loop:

```js
const admins = await Admin.find({}, 'email');
for (const admin of admins) {
  const emailResult = await emailService.sendNewApplicationNotification(
    admin.email, applicantName, email, buis_name, site_city
  );
}
```

Each iteration `await`s the previous one before starting. With 5 admins, this takes 5× the time of a single email send. With 20 admins it's 20×. The `await` inside a `for` loop is a well-known Node.js anti-pattern for I/O operations.

**Fix:** `await Promise.all(admins.map(admin => emailService.sendNewApplicationNotification(...)))`

---

### Flaw 7: No Pagination on Any List Endpoint

**Severity: Medium**

`GET /admin/allApplicants` fetches every single document from the `applicants` collection with no limit:

```js
const applicants = await Applicant.find().lean().sort({ doa: -1 });
```

With 1,000 applicants this loads roughly 1–2MB of JSON into server memory, serializes it, sends it over the wire, and stores it in React state on the client. With 10,000 applicants this becomes a serious performance and memory problem. The dashboard re-fetches this on every action (accept, reject, grant) making it even more expensive as the dataset grows.

Similarly, `POST /franchisee/getSales` with no date range returns the entire sales history for a franchisee with no limit — a franchise that has been operating for 5 years has ~1,825 records that are all loaded at once for the dashboard.

---

### Flaw 8: `area_sqft` and `site_floor` Stored as Strings

**Severity: Medium**

```js
area_sqft: String,
site_floor: String
```

Square footage is a numeric measurement. Storing it as a String means:
- Sorting franchisees by location size is impossible (string sort gives `"1000" < "200"` wrong results)
- Arithmetic (e.g., total floor space across all franchises) requires runtime parsing
- Form input like `"abc"` or `"2500 sqft"` would be accepted and stored without error

---

### Flaw 9: Redundant Database Index on `SalesData.email`

**Severity: Low**

In `models/SalesData.js`, the `email` field is declared with `index: true`:

```js
email: { type: String, required: true, index: true }
```

And the schema also declares a compound index:

```js
salesDataSchema.index({ email: 1, dos: 1 });
```

A compound index with `email` as the leading key already satisfies all queries that filter by `email` alone — MongoDB can use the compound index for single-field `email` queries. The standalone `email` index is therefore redundant and creates extra overhead on every write operation: inserting or updating a `SalesData` document now has to maintain two indexes instead of one.

---

### Flaw 10: Credentials Displayed in Plaintext in the UI

**Severity: Medium**

When a franchise is granted, the generated password is returned from the API and displayed in the `SuccessModal` in plaintext:

```js
res.json({
  stat: true,
  password: password, // Plaintext password in HTTP response
  email: email
});
```

The React component then renders it on screen and even provides a "Copy Credentials" button. If an admin is screen sharing, in an open-plan office, or if their browser history/network logs are inspected, the password is exposed. The password also travels in the HTTP response body — while HTTPS encrypts it in transit, it is logged by any network proxy or APM tool that captures response bodies.

**Better approach:** Send the credentials only via email. If email fails, generate a one-time display token and show a "view credentials" link that expires after 10 minutes, rather than embedding the password in the primary API response.

---

### Flaw 11: `FranchiseCredential` Collection Name Has a Permanent Typo

**Severity: Low**

```js
collection: 'franchise_credentails' // Intentional typo — credentails not credentials
```

The collection in MongoDB is permanently named `franchise_credentails`. While the codebase works correctly because both the schema and the actual collection name share the same typo, this creates confusion for:
- Any developer who queries MongoDB directly and tries to find a collection called `franchise_credentials`
- Any future migration or database documentation
- Any reporting or analytics tool that connects directly to MongoDB and lists collection names

---

### Flaw 12: No Rate Limiting on Any Endpoint

**Severity: High**

There is no rate limiting middleware (e.g., `express-rate-limit`) on any endpoint. This exposes the API to:

- **Brute force attacks on login** — an attacker can try thousands of email/password combinations per second against `POST /admin/login` or `POST /franchisee/login` with no throttling
- **Spam on application submission** — `POST /applicant/apply` can be hit in a loop to create thousands of dummy applications (the duplicate email check only prevents one per email, but an attacker can use different emails)
- **Email bombing** — each application submission triggers notification emails to all admins; a bot could flood admin inboxes

**Fix:** `npm install express-rate-limit` and apply different limits to different endpoints — strict on login (5 attempts per 15 minutes per IP), moderate on application submission (10 per hour per IP).

---

### Flaw 13: React Router Auth Guard Is Trivially Bypassed

**Severity: High**

The client-side auth guard in `AdminDashboard.jsx`:

```js
const userType = localStorage.getItem('userType');
if (userType !== 'admin') navigate('/login');
```

Can be bypassed in two seconds by opening the browser console and running:

```js
localStorage.setItem('userType', 'admin');
localStorage.setItem('email', 'any@email.com');
```

Then navigating to `/admin`. The admin UI will render. And since there is no server-side protection, every API call from that UI will also succeed. This means the "auth guard" provides zero actual security — it only redirects confused users, not malicious ones.

---

*End of Document*

*Document covers: Backend MVC architecture, Frontend SPA architecture, full data flow traces (application submission, franchisee login), all four Mongoose models with relationships, directory structure, top 10 dependencies (including bcrypt added in latest update), authentication audit, state management analysis, identified security/performance weaknesses, 20 exhaustive senior-level Q&A with cheat sheets, 8 development challenges with solutions, 13 current flaws with severities and fixes, and a full changelog of the bcrypt password hashing update.*

---

## CHANGELOG — CODEBASE UPDATES

### Update 1 — Password Hashing Implementation

**Files modified:** `backend/package.json`, `backend/models/Admin.js`, `backend/models/FranchiseCredential.js`, `backend/controllers/adminController.js`, `backend/controllers/franchiseeController.js`

#### What Changed and Why

**`backend/package.json`**

`bcrypt` v6.0.0 was added to `dependencies`. This is the only new package introduced. It is a Node.js binding for the bcrypt hashing algorithm, which is the industry standard for password storage because it is intentionally slow (configurable work factor) and includes a random salt automatically.

**`backend/models/Admin.js`**

Two additions were made to the Mongoose schema:

```js
const bcrypt = require('bcrypt');

// 1. Pre-save hook — runs automatically before every .save() call
adminSchema.pre('save', async function() {
  if (!this.isModified('password')) return; // Guard: skip if password unchanged
  const salt = await bcrypt.genSalt(10);    // Generate salt with 10 work factor rounds
  this.password = await bcrypt.hash(this.password, salt); // Replace plaintext with hash
});

// 2. Instance method — called explicitly on a retrieved document
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // Returns boolean Promise
};
```

The `isModified('password')` guard is the most important line in the hook. Mongoose tracks which fields have been modified since the document was loaded. Without this guard, every call to `admin.save()` — even to update `fname` — would re-hash the already-hashed password string, producing a hash of a hash. The next login attempt would then try to compare a raw password against a doubly-hashed value and always fail.

**`backend/models/FranchiseCredential.js`**

Identical changes applied — same `pre('save')` hook and same `comparePassword` method added. The logic is identical because the same security requirement applies to franchisee credentials.

**`backend/controllers/adminController.js` — `login` endpoint**

```js
// BEFORE
const admin = await Admin.findOne({ email, password });
if (admin) { ... }

// AFTER
const admin = await Admin.findOne({ email });
if (admin && await admin.comparePassword(password)) { ... }
```

The password was removed from the MongoDB query entirely. Sending a raw password to MongoDB as a search field was the original flaw — even with hashing, querying `{ password: someHash }` would never match because each bcrypt hash is unique (different salts). The correct flow is: fetch the document by email, then compare in Node.js memory using `bcrypt.compare`.

**`backend/controllers/franchiseeController.js` — `login` endpoint**

Same change as admin login:

```js
// BEFORE
const franchisee = await FranchiseCredential.findOne({ email, password });
if (franchisee) { ... }

// AFTER
const franchisee = await FranchiseCredential.findOne({ email });
if (franchisee && await franchisee.comparePassword(password)) { ... }
```

**`backend/controllers/franchiseeController.js` — `changePassword` endpoint**

```js
// BEFORE
const credential = await FranchiseCredential.findOne({ email, password: currentPassword });
if (!credential) return res.json({ stat: false, msg: 'Current password is incorrect' });
credential.password = newPassword;
await credential.save(); // Triggers pre-save hook — newPassword gets hashed ✅

// AFTER
const credential = await FranchiseCredential.findOne({ email });
if (!credential || !(await credential.comparePassword(currentPassword))) {
  return res.json({ stat: false, msg: 'Current password is incorrect' });
}
credential.password = newPassword;
await credential.save(); // pre-save hook fires — newPassword gets hashed ✅
```

The `credential.save()` call correctly triggers the `pre('save')` hook, so the new password is hashed before being stored. This is the right pattern.

#### What Was NOT Changed (Known Residual Bug)

`adminController.changePassword` was **not updated** and remains broken in two ways:

```js
// adminController.js — changePassword — STILL NOT FIXED
const admin = await Admin.findOne({ email, password: currentPassword }); // Will never match bcrypt hash
await Admin.updateOne({ email }, { $set: { password: newPassword } });   // Bypasses pre-save hook
```

1. `findOne({ email, password: currentPassword })` sends the raw password to MongoDB. Since the stored password is now a bcrypt hash, this will never find a match. Admin password changes are currently non-functional.
2. `Admin.updateOne()` with `$set` calls the MongoDB driver directly, bypassing all Mongoose middleware including the pre-save hook. Even if the comparison were fixed, the new password would be stored as plaintext.

**This is a critical residual bug that needs to be fixed.** The fix is to replicate the franchisee pattern:

```js
exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.comparePassword(currentPassword))) {
    return res.json({ stat: false, msg: 'Current password is incorrect' });
  }
  admin.password = newPassword; // pre-save hook will hash this on .save()
  await admin.save();
  res.json({ stat: true, msg: 'Password changed successfully' });
};
```

#### Impact on Existing Data

Any admin or franchisee passwords stored in the database before this update are still plaintext. The pre-save hook only fires on `new Document().save()` or when `document.password` is modified and `document.save()` is called. Existing documents in MongoDB are not retroactively hashed. A migration script would be needed to hash all existing passwords — or all users would need to reset their passwords once after deployment.
