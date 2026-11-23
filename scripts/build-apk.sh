#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_SDK="/opt/android-sdk"
BUILD_TOOLS="$ANDROID_SDK/build-tools/35.0.0"
PLATFORM="$ANDROID_SDK/platforms/android-35/android.jar"
KEYSTORE="$ANDROID_SDK/mymoney.keystore"
WORK_DIR="/tmp/mymoney-apk-build"

if [ ! -x "$BUILD_TOOLS/aapt2" ] || [ ! -f "$PLATFORM" ]; then
  echo "ERROR: Android SDK build-tools 35.0.0 or android-35 platform missing under $ANDROID_SDK" >&2
  exit 1
fi

echo "[1/7] Building fresh Vite production bundle..."
cd "$ROOT_DIR"
npm run build

echo "[2/7] Preparing Android resources and offline web assets..."
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/res/mipmap-xxxhdpi" \
         "$WORK_DIR/res/mipmap-xxhdpi" \
         "$WORK_DIR/res/mipmap-xhdpi" \
         "$WORK_DIR/res/mipmap-hdpi" \
         "$WORK_DIR/assets/www" \
         "$WORK_DIR/java_gen" \
         "$WORK_DIR/classes" \
         "$WORK_DIR/dex_out"

cp "$ROOT_DIR/public/pwa-512x512.png" "$WORK_DIR/res/mipmap-xxxhdpi/ic_launcher.png"
cp "$ROOT_DIR/public/pwa-192x192.png" "$WORK_DIR/res/mipmap-xxhdpi/ic_launcher.png"
cp "$ROOT_DIR/public/pwa-192x192.png" "$WORK_DIR/res/mipmap-xhdpi/ic_launcher.png"
cp "$ROOT_DIR/public/pwa-192x192.png" "$WORK_DIR/res/mipmap-hdpi/ic_launcher.png"

cp -r "$ROOT_DIR/dist/"* "$WORK_DIR/assets/www/"
rm -f "$WORK_DIR/assets/www/"*.apk "$WORK_DIR/assets/www/"*.aab

echo "[3/7] Compiling Android resources with aapt2..."
"$BUILD_TOOLS/aapt2" compile --dir "$WORK_DIR/res" -o "$WORK_DIR/compiled_res.zip"

echo "[4/7] Linking resources and generating R.java..."
"$BUILD_TOOLS/aapt2" link \
  -o "$WORK_DIR/unsigned-unaligned.apk" \
  -I "$PLATFORM" \
  --manifest "$ROOT_DIR/scripts/android/AndroidManifest.xml" \
  -A "$WORK_DIR/assets" \
  -R "$WORK_DIR/compiled_res.zip" \
  --java "$WORK_DIR/java_gen" \
  --auto-add-overlay

echo "[5/7] Compiling Java sources and converting to DEX..."
JAVA_FILES=$(find "$WORK_DIR/java_gen" "$ROOT_DIR/scripts/android/src" -name "*.java")
javac -source 1.8 -target 1.8 -classpath "$PLATFORM" -d "$WORK_DIR/classes" $JAVA_FILES

CLASS_FILES=$(find "$WORK_DIR/classes" -name "*.class")
"$BUILD_TOOLS/d8" --lib "$PLATFORM" --min-api 24 --output "$WORK_DIR/dex_out" $CLASS_FILES

(cd "$WORK_DIR/dex_out" && zip -q "$WORK_DIR/unsigned-unaligned.apk" classes.dex)

echo "[6/7] Aligning APK..."
"$BUILD_TOOLS/zipalign" -f -p 4 "$WORK_DIR/unsigned-unaligned.apk" "$WORK_DIR/unsigned-aligned.apk"

echo "[7/7] Signing MyMoney.apk..."
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias mymoney \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "${KEYSTORE_PASS:-mymoney123}" \
    -keypass "${KEY_PASS:-mymoney123}" \
    -dname "CN=MyMoney, OU=Finance, O=MyMoney, L=Mobile, S=App, C=US"
fi

"$BUILD_TOOLS/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-pass "pass:${KEYSTORE_PASS:-mymoney123}" \
  --key-pass "pass:${KEY_PASS:-mymoney123}" \
  --out "$WORK_DIR/MyMoney-signed.apk" \
  "$WORK_DIR/unsigned-aligned.apk"

echo "Verifying signed APK..."
"$BUILD_TOOLS/apksigner" verify --print-certs "$WORK_DIR/MyMoney-signed.apk"

cp "$WORK_DIR/MyMoney-signed.apk" "$ROOT_DIR/public/MyMoney.apk"
cp "$WORK_DIR/MyMoney-signed.apk" "$ROOT_DIR/dist/MyMoney.apk"
ls -lh "$ROOT_DIR/public/MyMoney.apk"
