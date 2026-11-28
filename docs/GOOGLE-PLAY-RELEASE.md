# JamBeacon Android release preparation

Status: draft; this branch does not publish or modify the live website. The existing React/Vite source is the starting point, pending confirmation that it matches the current production version.

## Local setup
1. Install Node 22.12+ and Android Studio with Android SDK 36 and a compatible JDK.
2. Run `bash scripts/prepare-android.sh` from this branch.
3. Review the generated Android project's target SDK (36 or higher), compile SDK, app permissions, and dependencies. Test microphone recording, audio playback, storage, navigation, login and location on a real device; use native plugins where WebView behavior is inadequate.
4. Confirm the proposed package ID `com.jambeacon.app` before the first Play upload. Commit the generated Android project and npm lockfile after verification; never commit signing keys, passwords or secrets.
5. Run `npx cap open android`; build a debug APK for device testing, then create a signed Android App Bundle (.aab) with an upload key and enroll in Play App Signing. Keep the upload key secure and backed up.

## Launch blockers
- Confirm this source repository matches the intended live product. Its current README describes prototype payment handoffs, device-local data and unconnected production services.
- Verify backend account authentication, chat, uploaded audio, collaboration, storage access controls, data deletion and location privacy. Hide unfinished or simulated features instead of presenting them as live.
- Implement Google Play Billing for digital subscriptions, avatar items and saves, unless eligible for and enrolled in an applicable alternative billing program. Keep web checkout separate. The intended subscription is $9.99/month with a three-day trial; validate this against the current product. Verify purchase entitlements server-side, restore purchases and provide cancellation access.
- Add a truthful privacy policy, terms, account deletion in app and on web if accounts are supported, and report/block/moderation for shared music, chat and other user content. Confirm music rights, microphone/location consent, data retention and age eligibility.
- Verify icons, screenshots, review credentials, content rating, Data safety, app access and target audience declarations.

## Play Console
Create or verify a developer account at https://play.google.com/console/signup ($25 one-time registration). Create a free-to-download Music & Audio app, proposed name JamBeacon. New personal accounts generally need at least 12 opted-in closed testers continuously for 14 days and must apply for production access. Recruit 15–20 real testers to allow for attrition. Do not upload to production until release blockers have been verified.

Draft store description: Find musicians, jam over backing tracks, build your rockstar avatar, and collaborate on your next song. Only advertise features verified in the actual release.

Official references:
- https://support.google.com/googleplay/android-developer/answer/6112435
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://support.google.com/googleplay/android-developer/answer/10144311
- https://capacitorjs.com/docs/android
