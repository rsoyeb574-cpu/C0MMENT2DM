# Comment2DM ⚡

> **Tagline:** *"Comment karo. DM automatically chala jayega."*
> Automated Instagram comment-to-DM growth engine for creators, educators, coaches, and e-commerce brands. Built with official Meta APIs ("Instagram API with Instagram Login").

---

## 🗺️ Application Overview & Routes

| Section / Tab | Access Level | Description |
| :--- | :--- | :--- |
| **`/` (Landing)** | Public | High-converting landing page with live interactive 4-step workflow, use cases, pricing tiers, and FAQ. |
| **`/login`** | Public | Authentication with email & password validation, remember state, and **1-Click Demo Login** (`demo@comment2dm.com`). |
| **`/signup`** | Public | Account registration with full field validation and terms agreement. |
| **`/dashboard`** | **Protected** | Command center with quick access to Campaign Builder, Lead Inbox, Setup Guide, KPI metrics, and activity feeds. |
| **`/campaigns`** | **Protected** | Smart Campaign Builder wizard, activation status gates, trigger keyword rules, and duplicate/edit controls. |
| **`/inbox` (Lead Inbox)** | **Protected** | Complete lead management with 6 statuses (`New`, `Interested`, `Needs follow-up`, `Link sent`, `Converted`, `Not interested`), search, filters, notes, and a **6-stage status timeline per comment**. |
| **`/followup` (Follow-up Assistant)** | **Protected** | 5 editable follow-up templates, AI drafting engine, mandatory human review & approval, Instagram messaging window compliance, and zero bulk spam. |
| **`/coach` (Campaign Coach)** | **Protected** | Data-grounded AI advisor answering: Best campaign? Best keywords? Where leads drop off? What to test next? Includes missing-data diagnosis and small experiments. |
| **`/analytics`** | **Protected** | 100% event-verified metrics labeled as `[Measured]`, `[Estimated]`, or `[Unavailable]`. Tracked link redirect logs and daily trend audit. |
| **`/simulator`** | **Protected** | Test Automation Sandbox: simulates follower comments through the full 6-stage pipeline (`Comment detected → Campaign matched → Eligibility checked → Message prepared → Sent → Result recorded`) with mobile preview. |
| **`/templates`** | **Protected** | 9 high-converting templates (`Free Ebook`, `Course`, `Product Launch`, `Price Inquiry`, `Discount`, `Appointment Booking`, `Webinar`, `Service Inquiry`, `Affiliate Offer`). All editable and duplicatable. |
| **`/onboarding` (Setup Guide)**| **Protected** | 8-step onboarding wizard with progress indicator and honest Instagram connection guidance (no fake connected state). |
| **`/instagram`** | **Protected** | Meta Instagram setup center with OAuth status, permission checklists, webhook health diagnostics, and Error Logs tab. |
| **`/settings`** | **Protected** | Sandbox latency controls, account settings, and JSON backup export. |

---

## 🔗 Meta App Setup & Vercel Configuration Guide

Comment2DM uses **only the official Meta APIs** via **Instagram API with Instagram Login** (formerly Business Login for Instagram).

### 1. Create Meta Developer App
1. Navigate to [Meta for Developers](https://developers.facebook.com/) and click **My Apps** > **Create App**.
2. Select **Other** as the use case, then choose **Business** app type.
3. In the App Dashboard, add **Instagram** product (select **Instagram API with Instagram Login**).

### 2. Required Permissions
Ensure your Meta app requests the following three official permissions:
- `instagram_business_basic`: Access profile, username, media, and basic metrics.
- `instagram_business_manage_comments`: Receive real-time comment webhook events and read comment text.
- `instagram_business_manage_messages`: Dispatch automated private replies to comments as direct messages.

### 3. Vercel Domain Configuration & URLs
Configure your Meta App settings using your Vercel deployment URL (e.g., `https://comment2dm.vercel.app`):

| Meta Configuration Field | Production / Vercel URL Value | Local Development Value |
| :--- | :--- | :--- |
| **Valid OAuth Redirect URIs** | `https://<your-vercel-domain>.vercel.app/api/auth/instagram/callback` | `http://localhost:3000/api/auth/instagram/callback` |
| **Webhook Callback URL** | `https://<your-vercel-domain>.vercel.app/api/webhooks/instagram` | `http://localhost:3000/api/webhooks/instagram` (or ngrok) |
| **Webhook Verify Token** | Value of `INSTAGRAM_VERIFY_TOKEN` from `.env` | Value of `INSTAGRAM_VERIFY_TOKEN` from `.env` |
| **Webhook Subscribed Fields**| `comments` | `comments` |
| **App Domains** | `<your-vercel-domain>.vercel.app` | `localhost` |
| **Privacy Policy URL** | `https://<your-vercel-domain>.vercel.app/privacy` | `http://localhost:3000/privacy` |
| **Terms of Service URL** | `https://<your-vercel-domain>.vercel.app/terms` | `http://localhost:3000/terms` |

### 4. Webhook Security & Signatures
- **GET `/api/webhooks/instagram`**: Handles hub verification with challenge handshake using `INSTAGRAM_VERIFY_TOKEN`.
- **POST `/api/webhooks/instagram`**: Validates `X-Hub-Signature-256` HMAC using your `INSTAGRAM_APP_SECRET`. Unsigned or tampered requests are rejected with `401 Unauthorized`.
- Responds with `200 OK` immediately, then handles comment matching, duplicate prevention, and message dispatch asynchronously.

### 5. Private Reply Constraints (Official Meta Rules)
- Direct messages are sent as an official **Private Reply** to the comment using `POST https://graph.instagram.com/v21.0/{ig_user_id}/messages` with `recipient: { "comment_id": "<COMMENT_ID>" }`.
- **7-Day Freshness Rule:** Private replies are only allowed within 7 days of the comment timestamp. Older comments are skipped and logged.
- **Single-Reply Limit:** Meta enforces strictly 1 private reply per comment ID. Duplicates are rejected with clear error messages.
- Marked as "Sent successfully" **only after Meta returns an official confirmation (`message_id`)**.

---

## 🔒 Security & Data Architecture

- **Token Encryption (AES-256-GCM):** Long-lived user tokens (60-day) are encrypted at rest using `TOKEN_ENCRYPTION_KEY` (AES-256-GCM with unique 12-byte initialization vectors and 16-byte authentication tags).
- **Zero Frontend Secret Exposure:** Access tokens and client secrets are never sent to the client browser.
- **Per-User Isolation:** Each user's campaigns, leads, and activity logs are strictly scoped to their authenticated user account (`localStorage` keys scoped with `_${user.id}`).
- **Setup Required State:** If credentials, permissions, or token status are missing, the UI renders an honest "Setup Required" state rather than a fake connected state.

---

## 🛠️ Smart Campaign Builder & Features

### 1. Smart Campaign Wizard
The 5-step campaign builder guides you through:
1. **Basics & Offer:** Campaign name, the core offer (e.g. Free eBook, Consultation), and destination link.
2. **Post / Reel:** Target specific Instagram post/reel shortcode or apply to all posts.
3. **Trigger Keywords:** Multiple triggers with Match Type options (`Contains` vs `Exact match`).
4. **Automated Copy & CTAs:** Public comment reply, private direct message copy, and call-to-action button.
5. **Qualification & Verification:** Optional lead qualification questions (e.g. "What is your monthly budget?"), live iPhone preview, and **Setup Verification Gate**.

### 2. "AI Suggest" Button
Clicking the **"AI Suggest"** button analyzes your campaign's offer and automatically generates:
- High-converting trigger keywords
- Engaging public comment replies (with dynamic `{name}` handles)
- High-converting direct message copy
- Strong CTA labels
- Relevant qualification questions
The user can preview and edit every field before verification.

### 3. Setup Verification Gate
Campaigns cannot be toggled to "Active" until:
- At least one trigger keyword is specified
- Destination URL is valid (`http://` or `https://`)
- Private DM message contains a placeholder for `{link}`
- Setup is verified via the campaign builder preview

### 4. 9 Pre-Built Campaign Templates
1. **Free Ebook / Guide Instant Delivery** (Lead magnet)
2. **Online Course Enrollment & Syllabus** (Education)
3. **Product Launch VIP Waitlist** (E-commerce / Launch)
4. **Price Inquiry & Commercial Quote** (High-ticket B2B)
5. **Exclusive Discount & Coupon Code** (Flash sales)
6. **Appointment & Discovery Call Booking** (Coaching / Consulting)
7. **Live Webinar & Masterclass Registration** (Live events)
8. **Client Service Inquiry & Intake** (Agencies & Freelancers)
9. **Affiliate Offer & Recommended Products** (Influencers)

All templates can be filtered, previewed, applied with 1-click, edited, duplicated, and deleted.

### 5. Lead Inbox
- **Statuses:** `New`, `Interested`, `Needs follow-up`, `Link sent`, `Converted`, `Not interested`.
- Search by username, comment text, or campaign name.
- Filter by status and source campaign.
- Inline notes editor with instant auto-save.
- CSV export for CRM integration.
- **6-Stage Status Timeline per Comment:**
  1. `Comment detected`
  2. `Campaign matched`
  3. `Eligibility checked`
  4. `Message prepared`
  5. `Sent`
  6. `Result recorded`

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Populate `.env` with your Meta Developer credentials and a 64-character hex encryption key for `TOKEN_ENCRYPTION_KEY`.

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Run Lint & Build Checks
```bash
npm run lint
npm run build
```

---

---

## 📊 Event-Verified Analytics (`/analytics`)

Comment2DM features an anti-hallucination telemetry engine:
- **100% Real Recorded Events:** Derived strictly from verified database records:
  - Comments detected (webhook triggers + simulator events)
  - Eligible comments (passed 7-day freshness and exactly-once deduplication)
  - Messages dispatched (confirmed by Meta Graph API response)
  - Failures and policy blocks (logged in error database)
  - Tracked redirect clicks (recorded via `/r/:campaignId?lead=:leadId`)
  - Leads captured in CRM
- **Reliability Badges:**
  - `[Measured]` for directly verified event counts and mathematical ratios (`clicks / sent`).
  - `[Estimated]` for sampled metrics like average Graph API latency.
  - `[Unavailable]` for off-platform sales and revenue ($), preventing fake or invented metrics.
- **Tracked Redirect Verification Station:**
  Includes a live test station to simulate tracked clicks and verify real-time event recording, complete with a timestamped audit log.

---

## 🧠 Campaign Coach (`/coach`)

An AI performance diagnostic engine grounded exclusively in your actual data:
1. **Which campaign performs best?** Ranks campaigns by engagement volume, delivery rate, verified click-throughs, and qualified leads.
2. **Which keywords bring qualified leads?** Measures the qualification rate of leads (marked Interested or Converted) per keyword.
3. **Where leads drop off?** Evaluates the 5-stage funnel (`Comments Detected → Eligible Comments → DMs Sent → Tracked Clicks → Qualified Leads`) and pinpoints the primary bottleneck.
4. **What to test next?** Actionable experiments with clear hypotheses, 3-step checklists, and target metrics.
- **Insufficient Data Guard:** When data volume is low, clearly alerts what data is missing and prescribes a low-risk, small experiment to establish baseline metrics.
- **Diagnostic Q&A Terminal:** Ask custom performance questions and receive answers strictly grounded in your workspace data.

---

## 💬 Follow-Up Assistant (`/followup`)

A compliant lead nurturing workflow that enforces human oversight:
- **5 Editable Master Templates:**
  1. *Ask if they need details* (Polite low-pressure check-in)
  2. *Answer common questions* (Proactively clears top 3 FAQs)
  3. *Share offer link again* (Resurfaces destination URL)
  4. *Book a consultation* (Invites warm leads to 1-on-1 strategy call)
  5. *Re-engage before deadline* (Urgency check-in before promo closes)
- **AI Personalized Drafting:** Analyzes follower comments, keywords, CRM notes, and campaign offers to generate tailored messages.
- **Mandatory Human Review & Approval:** Outbound DMs are **never sent automatically in bulk**. Every single message must be reviewed, edited, and approved by a human operator.
- **Meta Policy & Anti-Spam Compliance:** Enforces Instagram's 24-hour standard messaging window and 7-day private reply window. Disallows bulk messaging to protect account standing.
- **Clear Separation:** Explicitly distinguishes `[Verified Facts]` (from Meta webhooks) from `[AI Suggestions]` (strategic angles).

---

## 🧪 Verification & Testing Steps

1. **Test User Authentication & Data Isolation:**
   - Log in using **"1-Click Demo Login"** on `/login`. Notice demo campaigns and leads.
   - Log out, sign up with a new account (e.g. `test@example.com`).
   - Verify that the new user has a clean, isolated workspace with zero leaking from other users.
2. **Test Smart Campaign Builder:**
   - Go to **Campaigns** > Click **"Create Campaign"**.
   - Enter offer: *"Free 30-Day Workout Guide"*. Click **"AI Suggest"**.
   - Verify that keywords (`WORKOUT`, `FITNESS`, `GUIDE`), public reply, DM draft, and CTA are automatically filled.
   - Verify that you cannot activate the campaign without completing setup verification.
3. **Test 9 Campaign Templates:**
   - Navigate to **Templates** tab.
   - Filter by each category: Ebook, Course, Launch, Pricing, Discount, Booking, Webinar, Service, Affiliate.
   - Click **"Duplicate"** or **"Use Template"** to open the wizard pre-populated.
4. **Test Lead Inbox & 6-Stage Timeline:**
   - Go to **Lead Inbox** (`/inbox`).
   - Click on any lead to open the detail panel.
   - Inspect the **6-Stage Status Timeline** (`Comment detected` → `Campaign matched` → `Eligibility checked` → `Message prepared` → `Sent` → `Result recorded`).
   - Update status to `Converted` or add a customer note. Verify changes persist.
5. **Test Follow-Up Assistant (`/followup`):**
   - Click **"Open in Follow-up Assistant"** from any lead in Lead Inbox or open **Follow-up Assistant** from the sidebar.
   - Switch between the 5 editable master templates.
   - Verify that `[Verified Facts]` are clearly marked with green badges and `[AI Suggestions]` with purple badges.
   - Edit the draft in the textarea and click **"Approve & Send Follow-up DM"**.
   - Check the **Verified Outbound Follow-Up Audit Log** to confirm the record was added with operator confirmation.
6. **Test Campaign Coach (`/coach`):**
   - Navigate to **Campaign Coach** in the sidebar.
   - Click through all 4 core questions: Best Campaign, Qualified Keywords, Lead Drop-off, and What to Test Next.
   - If interaction volume is low, verify that the Insufficient Data Warning appears with missing reasons and prescribed small experiments.
   - Type a question into the custom diagnostic terminal (e.g., *"Where are leads dropping off?"*) and verify the grounded response.
7. **Test Event-Verified Analytics & Tracked Redirects (`/analytics`):**
   - Open **Analytics** from the sidebar.
   - Check that every KPI is labeled as `Measured`, `Estimated`, or `Unavailable`.
   - Verify that Checkout Sales / Revenue is explicitly labeled `Unavailable (Not invented)`.
   - Scroll down to the **Tracked Redirect Verification Station**. Select a campaign and click **"Simulate Real Link Click"**.
   - Watch the **Tracked Redirect Clicks** count and **Measured CTR** increment instantly, and verify the event appears in the **Tracked Click Audit Table**.
8. **Test Onboarding Wizard:**
   - Go to **Setup Guide** (`/onboarding`).
   - Step through the 8 stages with the progress bar. In Step 3 (Connect Instagram), verify honest setup guidance.
9. **Test Simulator & Error Scenarios:**
   - Go to **Simulator** (`/simulator`).
   - Test matching comments (e.g., `PDF please`). Watch the live 6-stage pipeline execute with mobile mockup.
   - Test duplicate comment to verify exactly-once deduplication rule enforcement.

