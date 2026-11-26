# JamBeacon free preview and Supporter Package — product decision

Supersedes the proposed mandatory monthly membership and earlier one-time paid-download plans. The app is free to download, with a 72-hour interactive preview and an optional US $9.99 one-time Supporter Package. No automatic charge at expiry, no mandatory recurring subscription. This is a product specification, not an implemented payment system.

## Access
- Start the preview on first authenticated activation, using a server-recorded UTC timestamp, not installation or a client-editable clock.
- During preview, allow avatar customization, personal profile, Jam Shack recording and saves, Loop Station and Collab Room exploration, and available Beacon demo/testing features.
- After expiry, continue free browsing and temporary practice, but lock new permanent saves and editing/retention of trial progress behind the Supporter Package.
- Supporter entitlement unlocks profile/avatar progress, experience points and the 20-track recording vault. Saving the 21st track replaces the oldest as previously designed. Suggested bonus: Founding Supporter badge.
- Keep independently purchased items accessible regardless of preview expiry. Never erase payment entitlements.
- Proposed safeguard: disclose save limitations before recording, warn before expiry, retain trial work read-only for 30 days after expiry and permit free export of original audio and user-requested deletion; restore progress if upgraded within retention. Do not automatically delete existing accounts or existing user work when migrating. Any irreversible purge must be separately reviewed, implemented with clear advance notices and tested. Actual retention promises must match implemented storage behavior.
- Live Beacon access pricing remains a separate decision (previously discussed $5); do not silently bundle unlimited live location services or create another subscription.

## Google Play
- Free download; create a one-time non-consumable product with proposed ID `jambeacon_supporter`, US base price $9.99. Use Play Billing for Android unless an applicable alternative is deliberately implemented and compliant. This package confers functionality, so do not describe it as a donation exempt from billing.
- No automatic conversion after the preview; the user must explicitly authorize the purchase.
- Verify purchase tokens and entitlement ownership server-side, acknowledge purchases, handle refunds/revocations, and restore purchases on reinstall or new device. Read the localized price from the billing product catalog.
- Free access for authorized closed testers without requiring payment; test billing separately with license testers. Test expiry boundaries, reinstall/clock changes, failed/pending/refunded purchases, existing user migration, restoration, exports and retention.
- Update actual app UI, server permissions, privacy terms, data safety and store copy before activation. Current prototype stores data locally and has no verified account/entitlement service. Do not activate an insecure client-only paywall or delete user work while billing is unavailable.

Official docs:
- https://developer.android.com/google/play/billing/one-time-products
- https://developer.android.com/google/play/billing/lifecycle/one-time
- https://support.google.com/googleplay/android-developer/answer/9858738
