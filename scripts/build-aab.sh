#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_SDK="/opt/android-sdk"
BUILD_TOOLS="$ANDROID_SDK/build-tools/35.0.0"
PLATFORM="$ANDROID_SDK/platforms/android-35/android.jar"
BUNDLETOOL="$ANDROID_SDK/bundletool.jar"
KEYSTORE="$ANDROID_SDK/mymoney.keystore"
WORK_DIR="/tmp/mymoney-aab-build"
APP_PACKAGE="${1:-}"

if [ ! -x "$BUILD_TOOLS/aapt2" ] || [ ! -f "$PLATFORM" ] || [ ! -f "$BUNDLETOOL" ]; then
  echo "ERROR: Android SDK 35 build-tools, android-35 platform, or bundletool.jar missing under $ANDROID_SDK" >&2
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
         "$WORK_DIR/dex_out" \
         "$WORK_DIR/base_module"

cp "$ROOT_DIR/public/pwa-512x512.png" "$WORK_DIR/res/mipmap-xxxhdpi/ic_launcher.png"
cp "$ROOT_DIR/public/pwa-192x192.png" "$WORK_DIR/res/mipmap-xxhdpi/ic_launcher.png"
cp "$ROOT_DIR/public/pwa-192x192.png" "$WORK_DIR/res/mipmap-xhdpi/ic_launcher.png"
cp "$ROOT_DIR/public/pwa-192x192.png" "$WORK_DIR/res/mipmap-hdpi/ic_launcher.png"

cp -r "$ROOT_DIR/dist/"* "$WORK_DIR/assets/www/"
rm -f "$WORK_DIR/assets/www/"*.apk "$WORK_DIR/assets/www/"*.aab

echo "[3/7] Compiling Android resources with aapt2..."
"$BUILD_TOOLS/aapt2" compile --dir "$WORK_DIR/res" -o "$WORK_DIR/compiled_res.zip"

echo "[4/7] Linking proto-format base APK for App Bundle..."
LINK_ARGS=(
  --proto-format
  -o "$WORK_DIR/base-proto.apk"
  -I "$PLATFORM"
  --manifest "$ROOT_DIR/scripts/android/AndroidManifest.xml"
  -A "$WORK_DIR/assets"
  -R "$WORK_DIR/compiled_res.zip"
  --java "$WORK_DIR/java_gen"
  --auto-add-overlay
)
if [ -n "$APP_PACKAGE" ]; then
  LINK_ARGS+=(--rename-manifest-package "$APP_PACKAGE")
fi
"$BUILD_TOOLS/aapt2" link "${LINK_ARGS[@]}"

echo "[5/7] Compiling Java sources and converting to DEX..."
JAVA_FILES=$(find "$WORK_DIR/java_gen" "$ROOT_DIR/scripts/android/src" -name "*.java")
javac -source 1.8 -target 1.8 -classpath "$PLATFORM" -d "$WORK_DIR/classes" $JAVA_FILES

CLASS_FILES=$(find "$WORK_DIR/classes" -name "*.class")
"$BUILD_TOOLS/d8" --lib "$PLATFORM" --min-api 24 --output "$WORK_DIR/dex_out" $CLASS_FILES

echo "[6/7] Assembling Google Play Android App Bundle (.aab)..."
unzip -q "$WORK_DIR/base-proto.apk" -d "$WORK_DIR/base_module"
mkdir -p "$WORK_DIR/base_module/manifest" "$WORK_DIR/base_module/dex"
mv "$WORK_DIR/base_module/AndroidManifest.xml" "$WORK_DIR/base_module/manifest/AndroidManifest.xml"
cp "$WORK_DIR/dex_out/classes.dex" "$WORK_DIR/base_module/dex/classes.dex"

(cd "$WORK_DIR/base_module" && zip -qr "$WORK_DIR/base.zip" .)

java -jar "$BUNDLETOOL" build-bundle \
  --modules="$WORK_DIR/base.zip" \
  --output="$WORK_DIR/MyMoney-unsigned.aab"

echo "[7/7] Signing and validating MyMoney.aab..."
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

cp "$WORK_DIR/MyMoney-unsigned.aab" "$WORK_DIR/MyMoney-signed.aab"
jarsigner -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore "$KEYSTORE" \
  -storepass "${KEYSTORE_PASS:-mymoney123}" \
  -keypass "${KEY_PASS:-mymoney123}" \
  "$WORK_DIR/MyMoney-signed.aab" \
  mymoney >/dev/null

java -jar "$BUNDLETOOL" validate --bundle="$WORK_DIR/MyMoney-signed.aab"

cp "$WORK_DIR/MyMoney-signed.aab" "$ROOT_DIR/public/MyMoney.aab"
cp "$WORK_DIR/MyMoney-signed.aab" "$ROOT_DIR/dist/MyMoney.aab"
ls -lh "$ROOT_DIR/public/MyMoney.aab"
