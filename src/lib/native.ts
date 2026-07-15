// Lightweight Capacitor bridge. Runs only when the app is packaged in a
// native container (Android/iOS). On plain web, isNativePlatform() is false
// and this becomes a no-op, so existing Lovable web behaviour is untouched.
import { Capacitor } from "@capacitor/core";

export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
      import("@capacitor/status-bar"),
      import("@capacitor/splash-screen"),
      import("@capacitor/app"),
    ]);
    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: "#000000" }).catch(() => {});
    await SplashScreen.hide().catch(() => {});
    // Android hardware back — exit app when we can't go back further.
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  } catch (err) {
    console.warn("[native] init failed", err);
  }
}