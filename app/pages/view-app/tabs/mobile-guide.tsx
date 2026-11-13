import { type FC, useState } from "react";
import { CodeBlock } from "~/components/core";
import { Callout, Copyable } from "~/components/guides";
import { cn } from "~/lib/utils";
import type { SupportApp } from "~/utils/types";

type Tab = "react-native" | "flutter" | "ios" | "android" | "custom";

const TABS: { id: Tab; label: string }[] = [
  { id: "react-native", label: "React Native" },
  { id: "flutter", label: "Flutter" },
  { id: "ios", label: "iOS (Swift)" },
  { id: "android", label: "Android (Kotlin)" },
  { id: "custom", label: "Your own UI" },
];

const snippets = (chatUrl: string, apiBase: string, publicKey: string): Record<Exclude<Tab, "custom">, { install?: string; code: string }> => ({
  "react-native": {
    install: "npx expo install react-native-webview   # or: npm i react-native-webview",
    code: `import { WebView } from "react-native-webview";

const CHAT_URL = "${chatUrl}";

export function SupportScreen({ navigation, user }) {
  const params = new URLSearchParams({
    platform: "react-native",
    close: "1",                       // show a close button
    name: user?.name ?? "",           // optional: who's chatting
    email: user?.email ?? "",
    externalId: user?.id ?? "",
  });
  return (
    <WebView
      source={{ uri: \`\${CHAT_URL}?\${params}\` }}
      domStorageEnabled                // keeps the conversation between visits
      style={{ flex: 1 }}
      onMessage={(e) => {
        const event = JSON.parse(e.nativeEvent.data);
        if (event.type === "asotie:close") navigation.goBack();
      }}
    />
  );
}`,
  },
  flutter: {
    install: "flutter pub add webview_flutter",
    code: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

const chatUrl = '${chatUrl}';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key, this.email, this.name});
  final String? email;
  final String? name;
  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  late final WebViewController controller = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    ..addJavaScriptChannel('AsotieFlutter', onMessageReceived: (msg) {
      final event = jsonDecode(msg.message);
      if (event['type'] == 'asotie:close') Navigator.of(context).pop();
    })
    ..loadRequest(Uri.parse(chatUrl).replace(queryParameters: {
      'platform': 'flutter',
      'close': '1',
      if (widget.email != null) 'email': widget.email!,
      if (widget.name != null) 'name': widget.name!,
    }));

  @override
  Widget build(BuildContext context) =>
      Scaffold(body: WebViewWidget(controller: controller));
}`,
  },
  ios: {
    code: `import UIKit
import WebKit

final class SupportViewController: UIViewController, WKScriptMessageHandler {
    var email: String?
    var name: String?

    override func viewDidLoad() {
        super.viewDidLoad()
        let config = WKWebViewConfiguration()
        config.userContentController.add(self, name: "asotie")   // receives asotie:* events
        let webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)

        var url = URLComponents(string: "${chatUrl}")!
        url.queryItems = [
            URLQueryItem(name: "platform", value: "ios"),
            URLQueryItem(name: "close", value: "1"),
            URLQueryItem(name: "email", value: email),
            URLQueryItem(name: "name", value: name),
        ]
        webView.load(URLRequest(url: url.url!))
    }

    func userContentController(_ controller: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard let event = message.body as? [String: Any] else { return }
        if event["type"] as? String == "asotie:close" { dismiss(animated: true) }
    }
}`,
  },
  android: {
    code: `import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject

class SupportActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val webView = WebView(this)
        setContentView(webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true   // keeps the conversation between visits

        webView.addJavascriptInterface(object {
            @JavascriptInterface
            fun postMessage(json: String) {
                if (JSONObject(json).optString("type") == "asotie:close") runOnUiThread { finish() }
            }
        }, "AsotieAndroid")

        val url = Uri.parse("${chatUrl}").buildUpon()
            .appendQueryParameter("platform", "android")
            .appendQueryParameter("close", "1")
            .appendQueryParameter("email", intent.getStringExtra("email") ?: "")
            .build()
        webView.loadUrl(url.toString())
    }
}`,
  },
});

/** "Add the chat to your mobile app": a web view per platform, or the REST API for a native UI. */
export const MobileGuide: FC<{ app: SupportApp; appUrl: string }> = ({ app, appUrl }) => {
  const [tab, setTab] = useState<Tab>("react-native");
  const chatUrl = `${appUrl.replace(/\/$/, "")}/widget/${app.publicKey}`;
  const apiBase = app.endpoints.apiBaseUrl;
  const code = snippets(chatUrl, apiBase, app.publicKey);

  return (
    <div className="space-y-3">
      <p>
        Open this chat page full-screen in a web view inside your app. It&apos;s the same chat as your website, adapted
        for phones (safe areas, on-screen keyboard), and conversations are kept between visits.
      </p>
      <Copyable label="Chat URL" value={chatUrl} />
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              t.id === tab ? "bg-primary-600 text-white" : "bg-surface-2 text-ink-soft hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "custom" ? (
        <>
          {code[tab].install && <CodeBlock value={code[tab].install!} />}
          <CodeBlock value={code[tab].code} multiline />
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 text-ink-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">URL parameter</th>
                  <th className="px-3 py-2 font-medium">What it does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr><td className="px-3 py-2 font-mono">platform</td><td className="px-3 py-2">ios, android, react-native or flutter — turns on the phone layout</td></tr>
                <tr><td className="px-3 py-2 font-mono">close=1</td><td className="px-3 py-2">Shows a close button; tapping it sends <span className="font-mono">asotie:close</span> to your app</td></tr>
                <tr><td className="px-3 py-2 font-mono">name, email, externalId</td><td className="px-3 py-2">Optional: links the chat to the signed-in user, so their history follows them</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-muted">
            Events your app can listen for: <span className="font-mono">asotie:ready</span> (chat loaded),{" "}
            <span className="font-mono">asotie:close</span>, <span className="font-mono">asotie:unread</span> (an agent
            replied). You can also identify the user later by running{" "}
            <span className="font-mono">window.Asotie.identify(&#123; name, email, externalId &#125;)</span> in the web view.
          </p>
          {tab === "android" && (
            <Callout tone="info" title="Letting customers attach files on Android">
              Android web views need a <span className="font-mono">WebChromeClient</span> that implements{" "}
              <span className="font-mono">onShowFileChooser</span> for the paperclip button to open the file picker.
              iOS, React Native and Flutter handle it for you.
            </Callout>
          )}
        </>
      ) : (
        <>
          <p>
            Prefer a fully native chat screen? Your app can talk to the same public chat API the widget uses. It only
            needs this app&apos;s <strong>public key</strong> — never put the secret key in a mobile app.
          </p>
          <Copyable label="Public key" value={app.publicKey} />
          <CodeBlock
            multiline
            value={`# 1. Start (or resume) a session — store the returned token on the device
POST ${apiBase}/widget/apps/${app.publicKey}/session
     { "name": "Ama", "email": "ama@example.com", "externalId": "user_123", "token": "<stored token, if any>" }

# Then send  Authorization: Bearer <token>  with every request:
GET  ${apiBase}/widget/conversations                       # the customer's conversations
POST ${apiBase}/widget/conversations                       { "content": "Hi!" }
GET  ${apiBase}/widget/conversations/<id>                  # messages
POST ${apiBase}/widget/conversations/<id>/messages         { "content": "…", "attachments": [ … ] }
POST ${apiBase}/widget/conversations/<id>/rating           { "score": 5 }
POST ${apiBase}/uploads   (multipart field "file")         # attachments

# Live updates (Server-Sent Events):
POST ${apiBase}/realtime/ticket   { "channels": ["private-conversation-<id>"] }  → { "ticket" }
GET  ${apiBase}/realtime/stream?ticket=<ticket>            # events: message.created, conversation.updated`}
          />
        </>
      )}
    </div>
  );
};
