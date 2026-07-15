# Fuel & Flex — Android (Capacitor) build guide

The web app is unchanged. Capacitor wraps the built web bundle in a native
Android shell so it can be published to the Google Play Store.

## Prerequisites (one-time, local machine)

- Node 20+ and Bun (or npm)
- Android Studio Hedgehog+ with Android SDK 34 and JDK 17
- Set `ANDROID_HOME` and add `platform-tools` to your PATH

## First-time setup

```bash
bun install
bun run build           # produces dist/public (Capacitor webDir)
bun run cap:add:android # creates the android/ project (only once)
bun run cap:sync        # copies web build into the Android project
bun run cap:open:android
```

Then in Android Studio: **Run ▸ app** on an emulator or connected device.

## Configuration

- App ID: `app.lovable.fuelandflex` (change in `capacitor.config.ts` before
  first `cap add android`).
- App name: `Fuel & Flex`.
- Splash screen: black, 1.5 s. Status bar: dark, black.
- Safe-area insets are applied to `<body>` via CSS `env(safe-area-inset-*)`.
- Hardware back button: goes back in-app, exits when at root.

## Building a signed AAB for Play Store

1. Generate a keystore (once):
   ```bash
   keytool -genkey -v -keystore ~/keystores/fuelandflex.jks \
     -keyalg RSA -keysize 2048 -validity 10000 -alias fuelandflex
   ```
2. In `android/app/build.gradle` add a `signingConfigs.release` block that
   reads the keystore path/passwords from `~/.gradle/gradle.properties`.
3. Build:
   ```bash
   bun run android:build
   # -> android/app/build/outputs/bundle/release/app-release.aab
   ```
4. Upload the `.aab` to Google Play Console.

## Live reload against the Lovable preview

Uncomment the `server.url` block in `capacitor.config.ts` and point it at
the preview URL, then `cap sync android` and run. Great for testing UI on
device without a full rebuild.

## Notes / next steps

- App icons + splash images: drop 1024×1024 assets and run
  `npx @capacitor/assets generate --android`.
- Push notifications (FCM), Firebase Analytics/Crashlytics, offline sync,
  and the achievements/settings modules are intentionally out of scope for
  this first slice.