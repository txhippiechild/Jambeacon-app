#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Run from the Android preparation branch on Node 22.12+.
npm install
npm install @capacitor/core@8 @capacitor/android@8
npm install --save-dev @capacitor/cli@8
npm run build
if [ ! -d android ]; then
  npx cap add android
fi
npx cap sync android
printf '\nAndroid project prepared. Verify target SDK 36+, runtime permissions, and billing before release.\n'
printf 'Open with: npx cap open android\n'
