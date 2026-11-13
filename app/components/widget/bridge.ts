/**
 * Messaging between the chat page and whatever is hosting it:
 *   - a website, through the iframe opened by /widget.js (window.parent.postMessage)
 *   - a mobile app's web view (React Native, iOS WKWebView, Android WebView, Flutter)
 *
 * Mobile apps open `{APP_URL}/widget/{publicKey}?platform=ios|android|react-native|flutter`
 * and listen for these events:
 *   asotie:ready    the chat loaded
 *   asotie:close    the customer tapped close (only shown when ?close=1)
 *   asotie:unread   an agent replied while the chat was in the background
 */
export type Platform = "web" | "ios" | "android" | "react-native" | "flutter";

export const PLATFORM_LABELS: Record<Platform, string> = {
  web: "Website",
  ios: "iOS",
  android: "Android",
  "react-native": "React Native",
  flutter: "Flutter",
};

type NativeWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void };
  webkit?: { messageHandlers?: { asotie?: { postMessage: (message: unknown) => void } } };
  AsotieAndroid?: { postMessage: (message: string) => void };
  AsotieFlutter?: { postMessage: (message: string) => void };
};

const native = () => window as NativeWindow;

/** The `platform` query parameter wins; otherwise detect the bridge the app injected. */
export const detectPlatform = (param: string | null): Platform => {
  if (param && param in PLATFORM_LABELS) return param as Platform;
  if (typeof window === "undefined") return "web";
  const w = native();
  if (w.ReactNativeWebView) return "react-native";
  if (w.webkit?.messageHandlers?.asotie) return "ios";
  if (w.AsotieAndroid) return "android";
  if (w.AsotieFlutter) return "flutter";
  return "web";
};

export type HostEvent = "ready" | "close" | "unread";

/** Website hosts (widget.js) use the original `ttu:*` message names. */
const LEGACY_WEB_NAMES: Partial<Record<HostEvent, string>> = { close: "ttu:close", unread: "ttu:unread" };

export const sendToHost = (event: HostEvent, data: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  const message = { type: `asotie:${event}`, ...data };
  const json = JSON.stringify(message);
  const w = native();
  try {
    if (w.ReactNativeWebView) w.ReactNativeWebView.postMessage(json);
    if (w.webkit?.messageHandlers?.asotie) w.webkit.messageHandlers.asotie.postMessage(message);
    if (w.AsotieAndroid) w.AsotieAndroid.postMessage(json);
    if (w.AsotieFlutter) w.AsotieFlutter.postMessage(json);
    if (window.parent && window.parent !== window) {
      const legacy = LEGACY_WEB_NAMES[event];
      if (legacy) window.parent.postMessage({ type: legacy }, "*");
      window.parent.postMessage(message, "*");
    }
  } catch {
    /* a host without a listener is fine */
  }
};
