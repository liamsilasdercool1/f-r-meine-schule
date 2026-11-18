# Supabase setup for Kommaheld

1. In Netlify, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables (the publishable key is safe for browser use). Never add a secret/service-role key to the site.
2. In Supabase SQL Editor, run `supabase/schema.sql` from this repository.
3. Set the owner's role in Supabase SQL Editor after creating the account and confirming `liamsilas4@gmail.com`:
   `UPDATE auth.users SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"owner"}'::jsonb WHERE email = 'liamsilas4@gmail.com';`
   Then sign out and back in. Only the server-controlled `app_metadata` role grants owner access.
4. Redeploy the Netlify site.

The schema enables row-level security. Public users can read leaderboard profiles/progress; users can only write their own records. Owner actions use checked SQL functions. No password, secret key, or service-role key belongs in this repository.
