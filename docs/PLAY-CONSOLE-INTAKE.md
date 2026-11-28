# Play Console intake — draft, not submitted

## Listing fields
- App name: JamBeacon
- App type: App
- Category: Music & Audio
- Default language: English (United States)
- Download: Free
- Android ID: com.jambeacon.app (confirm availability before first upload)
- Short description: Build your rockstar avatar, jam over backing tracks and record your music.
- Draft full description for the checked-in prototype: JamBeacon brings music practice and creative play together. Customize a rockstar avatar, explore original backing loops, and record your own performance as you work through Road to Rockmania. Additional online features should be advertised only after their production implementation is verified.
- Intended membership: $9.99/month, three-day trial; do not enable until Play Billing and server-side entitlement verification are ready. Current source advertises a conflicting one-time unlock and must not be published as-is.
- Store support email: owner must confirm a monitored public address.
- Privacy policy: public, working URL required; verify actual data handling before writing or publishing final policy.
- Assets: 512x512 PNG icon, 1024x500 feature graphic, actual screenshots from the tested Android build (minimum two). No simulated screenshots.

## Android build
The branch workflow builds a debug APK and an unsigned release AAB, not a Play-ready signed release. It does not publish anything. Inspect the Actions result, test on physical Android phones, then create an upload key securely and sign the release bundle. Never put signing credentials in this public repository.

## Test acceptance
Record device, Android version, app version, expected behavior, observed behavior, pass/fail and corrective action for:
- Cold launch, navigation, back button, background/foreground, rotation and small screens.
- Jam Shack playback, microphone permission granted/denied, start/stop, loop mixing, replay, save and 20-save overwrite behavior.
- Avatar choices, persistence, shop and points.
- Real sign-in, sign-out, account deletion and associated data removal (when enabled).
- Real peer review and Collab Room exchange between two accounts, report/block and moderation (when enabled).
- Beacon location permission and approximate location sharing (when enabled).
- Billing test purchase, cancellation, restoration, trial and server entitlements (when enabled).
- Offline behavior, reconnect, slow network, crashes, accessibility and policy disclosures.

Do not mark a test passed based on source inspection alone.

## Google account and closed test
After identity approval, complete phone/device verification in Play Console if prompted. Create the app listing, finish required declarations and upload a signed AAB. For a qualifying new personal developer account, recruit 15–20 real testers so at least 12 remain opted in for 14 consecutive days. Record actual testing feedback, fix defects, then apply for production access. Do not fabricate tester participation or test results.

## Known blockers as of 2026-11-24
- Current source repository is an older prototype; reconcile with the intended live product.
- Live URL could not be independently verified during this audit.
- Android build outcome and real-device tests unverified.
- Release signing, privacy/terms, content rating, data safety, contact email, billing, backend, moderation and actual store screenshots incomplete or unverified.
- No production release authorized or performed.
