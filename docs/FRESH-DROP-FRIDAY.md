# Fresh Drop Friday — owner control center

Implemented in the unified release candidate; not yet deployed or connected to a database.

## One-time activation
1. Identify the existing JamBeacon Supabase project; restore it if paused. Back up and review existing schema and storage policies. Apply `supabase/migrations/202611260001_fresh_drops.sql` through the Supabase migration workflow or SQL editor to a test project first. The migration creates new tables and an artwork bucket; do not run twice.
2. In Authentication, create or identify the owner's confirmed email/password account. Obtain its actual user UUID from the dashboard. As a trusted database administrator (not through the public app), run `insert into public.jb_drop_admins(user_id) values ('REPLACE_WITH_OWNER_UUID'::uuid);`. Do not grant admin access to arbitrary sign-ups; enable MFA and enforce it before public production use if supported by the selected auth flow. Current email/password panel does not implement MFA challenges.
3. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the web and Android build environment using the verified project's public URL and publishable key (or legacy anon key). Never embed a service-role or secret key. For a local build copy .env.example to .env.local and fill these values. In CI pass repository environment variables explicitly to the npm build step.
4. Run npm install and npm run build; verify dist/admin/index.html and the customer app. Deploy the same validated source revision to the existing website and Android release pipeline. Verify the existing live domain is backed by that deployment; the previous web workflow pins an older commit and must be updated after validation.

## Daily use
- Visit https://jambeacon.com/admin/ after deployment. Sign in with the authorized owner account. Sign-in tokens are held in memory; reload or expiry requires sign-in again.
- Create a drop with name, category, description, artwork upload or URL, unique Play product ID, USD price (default $0.99), and date/time. The default is next Friday at 9 AM in the device's displayed time zone. The chosen instant is stored as UTC.
- Save a draft, or schedule the release. Drafts are invisible to customers. Scheduled rows become visible through the database's server-time policy at the release instant; no separate weekly job is needed. A connected customer screen polls every minute while open.
- Edit future releases, feature items on Beacon, view scheduled/live/archived status, or archive a drop. Live product ID, category, release date and base price cannot change; create a new drop or implement a separately verified pricing process. Archive hides the listing, not customer ownership.
- Recent changes appear in the administrator-only audit log. Product artwork uploads are public by URL, even before release; never upload private images.
- Notification and auto-equip fields store intent only. Push notification delivery, Google Play catalog creation, purchases, ownership and equipment integration remain unimplemented. Displayed USD pricing is a planned catalog price, not a verified billing price; no purchase button is enabled.

## Acceptance checks before publishing
- Build passes and /admin/ loads; ordinary accounts and anonymous users cannot insert/update drops, upload artwork, read unpublished rows or view audit logs. Verify existing storage policies do not inadvertently grant broader access.
- Owner can log in, create a draft, upload valid artwork, edit, schedule and archive; reject oversized/non-image files, invalid prices, duplicate product IDs and stale revisions.
- Test a release a few minutes ahead. Check anonymous catalog before and after server release time. Change the customer device clock and ensure future records stay hidden. Verify feature flag on Beacon and all released items in shop. Check UTC conversion, DST and local display.
- Verify audit events contain correct actor and before/after values; normal users cannot change them. Test expired sessions, owner access revocation and concurrent edits.
- Ensure no fake purchases or notification claims. Connect Play Billing, verify receipts and reconcile localized catalog pricing before enabling sales. Then implement durable ownership and entitlement-aware auto-equip.
- No recurring task is needed to publish scheduled catalog rows. Sending push notifications will need a separate idempotent delivery process with opt-in and deduplication.
