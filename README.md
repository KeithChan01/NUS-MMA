# NUS MMA – Training Sessions

A simple webapp for the NUS MMA team to sign up for training sessions.

- Members sign in with Google and sign up for sessions in one tap
- Coach manages sessions (create / delete, view roster) via a password-protected admin page
- Deployed free on Vercel + Supabase

---

## Setup

### 1. Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the SQL Editor, paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Enable Google OAuth:
   - Go to **Authentication → Providers → Google**
   - You'll need a Google OAuth client ID and secret. Create one at [console.cloud.google.com](https://console.cloud.google.com):
     - Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
     - Application type: **Web application**
     - Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Paste the client ID and secret into Supabase and save.

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=      # from Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY= # from Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=     # from Supabase → Settings → API (keep secret!)
ADMIN_PASSWORD=                # any strong password — this is the coach's login
```

### 3. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Netlify

1. Push this repo to GitHub.
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project → GitHub** → pick this repo.
3. Build settings are auto-detected from `netlify.toml` (no changes needed).
4. Under **Site configuration → Environment variables**, add the four env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
5. Click **Deploy site**. Netlify auto-deploys on every push to `main`.
6. **Add the Netlify URL as an allowed redirect** in Supabase:
   - Authentication → URL Configuration → Site URL: `https://your-app.netlify.app`
   - Add Redirect URLs: `https://your-app.netlify.app/auth/callback`

---

## Usage

| Who | URL | Action |
|-----|-----|--------|
| Members | `/` | Sign in with Google, tap a session to join/cancel |
| Coach | `/admin` | Enter admin password, create/delete sessions, view rosters |

Share the Netlify URL in the WhatsApp group. Members sign in once and the app remembers them.
