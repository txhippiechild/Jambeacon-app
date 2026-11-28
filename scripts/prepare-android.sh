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
# Jam Shack recording uses getUserMedia; declare only audio permissions.
python3 - <<'PY'
from pathlib import Path
import re
p = Path("android/app/src/main/AndroidManifest.xml")
s = p.read_text()
for permission in ("RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"):
    name = "android.permission." + permission
    if not re.search(r'android:name\s*=\s*["\']' + re.escape(name) + r'["\']', s):
        s = s.replace("</manifest>", f'    <uses-permission android:name="{name}" />\n</manifest>')
p.write_text(s)
PY
printf '\nAndroid project prepared. Verify target SDK 36+, runtime permissions, and billing before release.\n'
printf 'Open with: npx cap open android\n'
