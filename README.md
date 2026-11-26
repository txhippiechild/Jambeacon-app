# JamBeacon — single app source

The unified JamBeacon source is in this repository, `txhippiechild/Jambeacon-app`, on `android-play-store-prep` until its Android and web builds are validated and promoted to `main`. Do not develop new features on the previous avatar-shop, simplified-layout, or prototype branches. They remain historical recovery references. The separate Jambeacon-live repository is an existing published static build, not an independent app to develop; do not replace it until release checks pass.

## Five main screens

- Beacon: find musicians; current test map is explicitly a demo.
- Jam Shack: record over grooves, play and save up to 20 takes in the existing local recording vault.
- Loop Station: play, stop and repeat backing tracks. Existing built-in tracks plus an optional same-origin backing-tracks.json catalog.
- Collab Room: forum-style discussions and replies; currently local preview only.
- My Profile: artist name, bio, page color, avatar, music import and access to the avatar builder and shop.

The roster includes the recovered full-body JamBeacon character artwork, outfit variants, legacy starter avatars, per-character equipment and accessories, and optional user-imported avatar art. Purchases in the test build use local points only. Actual artwork alignment and persistence must be checked on Android devices.

## Build and release

- Web: npm install, npm run build.
- Android: bash scripts/prepare-android.sh; see the Android test workflow and docs/GOOGLE-PLAY-RELEASE.md.
- Release one app ID: com.jambeacon.app (verify availability in Play Console).
- No payments are active. Intended free 72-hour preview and $9.99 one-time Supporter Package, with separate paid Live Beacon access and optional $0.99 Fresh Drop Friday items, pending Play Billing integration and verification.
- Keep the current live site unchanged until the unified build is tested. No real accounts, live Beacon matching, shared forum, admin uploads, or cloud music storage have been confirmed; connect the existing backend and implement these before advertising them as working.

Release acceptance requires a successful build, real-device testing, privacy and data-safety review, signed AAB, and Google Play testing/approval. Never put service credentials or signing keys in this public repository.

## Owner control center

The Fresh Drop Friday scheduler is available at `/admin/` in a configured build. See `docs/FRESH-DROP-FRIDAY.md` for database setup, administrator authorization, build variables and acceptance tests. Catalog visibility is enforced by database time and row-level policies. Payments, notifications and automatic equipment are not yet connected.
