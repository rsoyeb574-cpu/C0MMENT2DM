# Comment2DM ⚡

> **Tagline:** *"Comment karo. DM automatically chala jayega."*
> Automated Instagram comment-to-DM growth tool for creators, educators, coaches, and e-commerce brands.

---

## 🗺️ Route Architecture & URL Endpoints

| Route (URL) | Access Level | Description |
| :--- | :--- | :--- |
| **`/`** | Public | High-converting landing page with hero, interactive 4-step workflow, use cases, pricing tiers, and FAQ. |
| **`/login`** | Public | User authentication page with email & password validation, remember state, and **1-Click Demo Login**. |
| **`/signup`** | Public | Account registration page with name, email, password confirmation, and terms agreement. |
| **`/forgot-password`** | Public | Password recovery flow with simulated reset token delivery. |
| **`/dashboard`** | **Protected** | Command center with total campaigns, active automations, comments processed, DMs sent, CTR%, conversion chart, and real-time activity feed. |
| **`/campaigns`** | **Protected** | Campaigns list with status toggle (Active/Paused), keyword rules, tabular figures, and full actions (Edit, Pause, Duplicate, Delete). |
| **`/simulator`** | **Protected** | Test Automation Sandbox: simulates follower comments, executes the 4-step pipeline (`Keyword detected ✓ → Campaign matched ✓ → DM prepared ✓ → Demo DM sent ✓`), updates live CTR metrics, and displays interactive receiver phone mock. |
| **`/templates`** | **Protected** | Reusable DM template library categorized by PDF, Course, Affiliate, Coupon, WhatsApp, and YouTube. |
| **`/analytics`** | **Protected** | Conversion analytics console with drop-off funnel, daily volume velocity charts, and Keyword Leaderboard. |
| **`/instagram`** | **Protected** | Meta Instagram setup center with mock authorization toggle and API setup checklist. |
| **`/settings`** | **Protected** | Sandbox data controls, simulated latency tuning (Ultra Fast vs Realistic vs Human), and JSON backup export. |

> **Route Protection Notice:** Visiting any protected route while logged out automatically redirects the user to `/login` with an informational banner, preserving their target destination upon login.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
# Application URL
APP_URL="http://localhost:3000"
PORT=3000
NODE_ENV="development"

# Session Security
SESSION_SECRET="comment2dm_super_secret_session_key_2026_dev_mode"

# Token Encryption (AES-256-GCM)
TOKEN_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Instagram API with Instagram Login (Business Login for Instagram)
INSTAGRAM_APP_ID=""
INSTAGRAM_APP_SECRET=""
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/auth/instagram/callback"
INSTAGRAM_VERIFY_TOKEN="comment2dm_instagram_verify_token_secure"
```

---

## 🔗 Instagram API with Instagram Login Setup Steps (Production Mode)

When transitioning from Phase 1 Demo Sandbox to Live Meta Graph API:

1. **Configure Business Login for Instagram:**
   - In [Meta for Developers](https://developers.facebook.com), set up **Instagram API with Instagram Login**.
   - Request the 3 required business permissions:
     - `instagram_business_basic`: Read account profile, media, and username.
     - `instagram_business_manage_comments`: Listen to and read comments via the `comments` webhook.
     - `instagram_business_manage_messages`: Dispatch automated private replies to comments.

2. **Configure Webhook Subscription:**
   - Set **Callback URL** to: `https://your-domain.com/api/webhooks/instagram`
   - Set **Verify Token** to the value of `INSTAGRAM_VERIFY_TOKEN` defined in `.env`.
   - Subscribe specifically to the `comments` field topic.

3. **Private Reply Dispatch Specifications:**
   - Endpoint: `POST https://graph.instagram.com/v21.0/{IG_USER_ID}/messages`
   - Payload:
     ```json
     {
       "recipient": { "comment_id": "<COMMENT_ID>" },
       "message": { "text": "<MESSAGE_TEXT>" }
     }
     ```
   - **Enforced Constraints:**
     - Must be dispatched **within 7 days** of the comment timestamp.
     - Permitted **exactly once per comment ID**.

4. **Token Security & Long-Lived Token Refresh:**
   - Short-lived tokens are exchanged for 60-day long-lived tokens via `graph.instagram.com/access_token`.
   - Tokens are encrypted server-side using **AES-256-GCM** with random 12-byte IV and 16-byte authentication tags.
   - Tokens are renewed before the 60-day expiry via `graph.instagram.com/refresh_access_token`.

---

## 🛡️ Sandbox & Demo Mode Features

- **Built-in Demo User:**
  - **Email:** `demo@comment2dm.com`
  - **Password:** `demo123456`
  - Available instantly via the **"1-Click Demo Login"** button on the `/login` page.
- **Local Persistence:** Accounts, campaigns, templates, and activity history persist across reloads in browser storage.
- **Zero API Risk:** Clear label **"DEMO MODE — No real Instagram message was sent."** ensures safety during demonstrations and testing.
