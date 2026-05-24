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

### 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Add the four environment variables above in the Vercel project settings.
4. Deploy. Vercel auto-deploys on every push to `main`.
5. **Add the Vercel URL as an allowed redirect** in Supabase:
   - Authentication → URL Configuration → Site URL: `https://your-app.vercel.app`
   - Add Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## Usage

| Who | URL | Action |
|-----|-----|--------|
| Members | `/` | Sign in with Google, tap a session to join/cancel |
| Coach | `/admin` | Enter admin password, create/delete sessions, view rosters |

Share the Vercel URL in the WhatsApp group. Members sign in once and the app remembers them.
