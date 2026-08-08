# Audio production rollout

The audio endpoints now enforce the user's server-side plan, a signed guest identity, per-identity and per-IP rate limits, an atomic global concurrency limit, free-plan quota, and Speechify `429` retries. Generated audio is uploaded from the browser directly to a private Supabase Storage bucket, so the audio blob no longer passes through a Vercel upload endpoint.

## Deployment order

1. Apply `supabase/migrations/20260808000000_audio_generation_guardrails.sql` to the production Supabase project.
2. Add `REQUEST_IDENTITY_SECRET` to Vercel as a long random value. The code falls back to `CLERK_SECRET_KEY`, but a separate secret is recommended.
3. Confirm the existing server-only variables are present: `SUPABASE_SERVICE_ROLE_KEY`, `SPEECHIFY_API_KEY`, and `CLERK_SECRET_KEY`. Never expose them with a `NEXT_PUBLIC_` prefix.
4. Deploy the application only after the migration succeeds. The new endpoints deliberately fail closed if the database guardrails are unavailable.
5. After deployment, test one guest generation, one signed-in generation, playback from **My Audios**, and download.

The migration creates the private `user-audio` bucket with a 100 MB object limit and adds `storage_path` and `file_size` to `audios`. Existing rows with public `audio_url` values remain playable; new rows use short-lived signed playback and download URLs.

## Default limits

| Control | Default |
| --- | ---: |
| Total Speechify requests in progress | 14 |
| Document streams in progress | 12 |
| Voice previews in progress | 2 |
| Requests in progress per identity | 1 |
| Document starts per identity | 5/minute |
| Document starts per IP | 30/minute |
| Preview starts per identity | 20/minute |
| Preview starts per IP | 60/minute |
| Free document generations | 3 |

These values can be overridden with the corresponding `AUDIO_*` environment variables in `lib/audio/config.ts`. The total of 14 intentionally leaves one request of headroom below the 15 concurrent requests available on the current Speechify plan.

## Verification commands

```sh
pnpm typecheck
pnpm build
```
