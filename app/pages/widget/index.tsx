import { type FC, type FormEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { ChevronLeftIcon, PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import config from "~/config";
import { detectPlatform, sendToHost, type Platform } from "~/components/widget/bridge";
import { ACCEPTED_FILE_TYPES, uploadFile } from "~/lib/uploads";
import { createStreamClient } from "~/utils/pusher";
import type { Attachment } from "~/utils/types";
import {
  dismissRating,
  readToken,
  wasRatingDismissed,
  widgetRequest,
  WidgetApiError,
  writeToken,
  type WidgetApp,
  type WidgetConversation,
  type WidgetCustomer,
  type WidgetMessage,
} from "~/components/widget/api";
import { Bubble, Initials, RatingPrompt } from "~/components/widget/parts";
import { cn } from "~/lib/utils";
import { formatShort } from "~/utils/date";

export function meta() {
  return [{ title: "Chat" }];
}

const POLL_THREAD_MS = 15000;
const POLL_LIST_MS = 20000;

type Identity = { name?: string | null; email?: string | null; externalId?: string | null };
type View = { name: "home" } | { name: "identify"; draft: string } | { name: "thread"; id: string };

const closeWidget = () => sendToHost("close");
const notifyUnread = () => sendToHost("unread");

/**
 * The chat customers see inside the iframe that /widget.js (served by the API)
 * opens on the organization's website. Talks to the widget REST API with a
 * long-lived customer token; no dashboard session, no GraphQL.
 */
const WidgetPage: FC = () => {
  const { publicKey = "" } = useParams();
  const [params] = useSearchParams();
  const host = params.get("host");
  // Mobile apps open this page in a web view with ?platform=… (see components/widget/bridge.ts).
  const platform: Platform = detectPlatform(params.get("platform"));
  const mobile = platform !== "web";

  const [app, setApp] = useState<WidgetApp | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<WidgetCustomer | null>(null);
  const [conversations, setConversations] = useState<WidgetConversation[]>([]);
  const [view, setView] = useState<View>({ name: "home" });
  // Apps can pass who's chatting in the URL: ?name=…&email=…&externalId=…
  const identity = useRef<Identity>({
    name: params.get("name"),
    email: params.get("email"),
    externalId: params.get("externalId"),
  });

  // The dashboard may run dark; the widget is always light, whatever the host page.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    // In an app's web view, draw edge to edge and respect the notch / home bar.
    if (mobile) {
      const viewport = document.querySelector('meta[name="viewport"]');
      viewport?.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
    }
  }, [mobile]);

  const createSession = useCallback(
    async (extra: Identity & { token?: string | null } = {}) => {
      const session = await widgetRequest<{ token: string; customer: WidgetCustomer }>(
        `/apps/${encodeURIComponent(publicKey)}/session`,
        {
          method: "POST",
          host,
          platform,
          body: {
            token: extra.token ?? null,
            name: extra.name ?? identity.current.name ?? null,
            email: extra.email ?? identity.current.email ?? null,
            externalId: extra.externalId ?? identity.current.externalId ?? null,
          },
        },
      );
      writeToken(publicKey, session.token);
      setToken(session.token);
      setCustomer(session.customer);
      return session;
    },
    [publicKey, host, platform],
  );

  const refreshList = useCallback(async (current: string | null) => {
    if (!current) return;
    try {
      const { items } = await widgetRequest<{ items: WidgetConversation[] }>("/conversations", { token: current });
      setConversations(items);
    } catch {
      /* keep the last list */
    }
  }, []);

  // Boot: app config, then resume a stored session (a new visitor gets one only when they write).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await widgetRequest<WidgetApp>(`/apps/${encodeURIComponent(publicKey)}`, { host, platform });
        if (cancelled) return;
        setApp(config);
        sendToHost("ready");
        const stored = readToken(publicKey);
        if (stored) {
          const session = await createSession({ token: stored }).catch(() => null);
          if (!cancelled && session) await refreshList(session.token);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof WidgetApiError && error.status === 404 ? "This chat isn't available." : "Can't connect right now.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey, host, platform, createSession, refreshList]);

  // Identify a signed-in user: from a website, Asotie.identify({ name, email }) in widget.js;
  // from a mobile app, call window.Asotie.identify({...}) inside the web view.
  useEffect(() => {
    const identify = (user: Identity) => {
      identity.current = {
        name: user.name ?? null,
        email: user.email ?? null,
        externalId: user.externalId ?? null,
      };
      void createSession({ token: readToken(publicKey) }).catch(() => undefined);
    };
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; user?: Identity } | null;
      if ((data?.type === "ttu:identify" || data?.type === "asotie:identify") && data.user) identify(data.user);
    };
    window.addEventListener("message", onMessage);
    (window as unknown as { Asotie?: unknown }).Asotie = { identify };
    return () => window.removeEventListener("message", onMessage);
  }, [createSession, publicKey]);

  useEffect(() => {
    if (view.name !== "home" || !token) return;
    const id = setInterval(() => void refreshList(token), POLL_LIST_MS);
    return () => clearInterval(id);
  }, [view.name, token, refreshList]);

  const color = app?.config.primaryColor ?? "#00827C";

  const start = async (draft: string, who?: Identity): Promise<string | null> => {
    if (!app) return null;
    let current = token;
    let email = customer?.email ?? null;
    if (who || !current) {
      const session = await createSession({ token: current, ...who });
      current = session.token;
      email = session.customer.email;
    }
    if (app.config.requireEmail && !email) {
      setView({ name: "identify", draft });
      return null;
    }
    const result = await widgetRequest<{ conversation: WidgetConversation }>("/conversations", {
      method: "POST",
      token: current,
      body: { content: draft },
    });
    setConversations((list) => [result.conversation, ...list]);
    setView({ name: "thread", id: result.conversation.id });
    return result.conversation.id;
  };

  if (loadError) {
    return (
      <Shell color={color} app={app}>
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-sm text-gray-600">{loadError}</p>
        </div>
      </Shell>
    );
  }

  if (!app) {
    return (
      <Shell color={color} app={null}>
        <div className="flex-1 space-y-3 p-5">
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </Shell>
    );
  }

  if (app.status !== "active") {
    return (
      <Shell color={color} app={app}>
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-gray-600">
          Chat is currently unavailable. Please try again later.
        </div>
      </Shell>
    );
  }

  if (view.name === "thread" && token) {
    return (
      <Shell color={color} app={app} onBack={() => {
        setView({ name: "home" });
        void refreshList(token);
      }}>
        <Thread conversationId={view.id} token={token} color={color} csatEnabled={app.csatEnabled !== false} />
      </Shell>
    );
  }

  if (view.name === "identify") {
    return (
      <Shell color={color} app={app} onBack={() => setView({ name: "home" })}>
        <IdentifyForm
          color={color}
          defaultName={customer?.name?.startsWith("Visitor ") ? "" : (customer?.name ?? identity.current.name ?? "")}
          onSubmit={async (who) => {
            identity.current = who;
            await start(view.draft, who);
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell color={color} app={app}>
      <Home
        app={app}
        color={color}
        conversations={conversations}
        onOpen={(id) => setView({ name: "thread", id })}
        onStart={start}
      />
    </Shell>
  );
};

/* ─────────────────────────────── Shell ─────────────────────────────── */

const Shell: FC<{ app: WidgetApp | null; color: string; onBack?: () => void; children: React.ReactNode }> = ({
  app,
  color,
  onBack,
  children,
}) => {
  // How the chat is hosted: a website iframe, or a mobile app's web view.
  const [params] = useSearchParams();
  const mobile = detectPlatform(params.get("platform")) !== "web";
  const showClose = !mobile || params.get("close") === "1";
  return (
  <div
    className={cn(
      "flex flex-col overflow-hidden bg-white font-sans text-gray-900",
      // dvh tracks the visible area, so the on-screen keyboard never hides the composer.
      mobile ? "h-[100dvh] pb-[env(safe-area-inset-bottom)]" : "h-screen",
    )}
  >
    <header
      className={cn("shrink-0 px-5 pb-5 text-white", mobile ? "pt-[calc(env(safe-area-inset-top)+1rem)]" : "pt-4")}
      style={{ background: color }}
    >
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="-ml-2 rounded-full p-1.5 hover:bg-white/15">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{app?.config.title || app?.organizationName || "Chat"}</p>
          {app?.config.subtitle && <p className="truncate text-xs text-white/80">{app.config.subtitle}</p>}
        </div>
        {showClose && (
          <button onClick={closeWidget} aria-label="Close chat" className="-mr-2 rounded-full p-1.5 hover:bg-white/15">
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {app && app.agents.length > 0 && !onBack && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {app.agents.map((a) => (
              <Initials key={a.name} name={a.name} src={a.avatarUrl} color="rgba(0,0,0,.25)" />
            ))}
          </div>
          <span className="text-xs text-white/85">
            {app.agentsOnline} {app.agentsOnline === 1 ? "person" : "people"} online
          </span>
        </div>
      )}
    </header>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    <p className="shrink-0 py-1.5 text-center text-[10px] text-gray-400">Powered by Asotie</p>
  </div>
  );
};

/* ─────────────────────────────── Home ──────────────────────────────── */

const Home: FC<{
  app: WidgetApp;
  color: string;
  conversations: WidgetConversation[];
  onOpen: (id: string) => void;
  onStart: (draft: string) => Promise<string | null>;
}> = ({ app, color, conversations, onOpen, onStart }) => {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onStart(text);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-end gap-2">
          <Initials name={app.organizationName || "Team"} src={app.organizationLogoUrl} color={color} className="shrink-0 border-0" />
          <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2 text-sm leading-relaxed text-gray-900">
            {app.config.greeting || "Hi there 👋 How can we help?"}
          </div>
        </div>

        {conversations.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Your conversations</p>
            <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpen(c.id)}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-gray-50"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-900">{c.lastMessagePreview || c.subject || "Conversation"}</p>
                    <p className="text-xs text-gray-400">
                      {c.status === "resolved" || c.status === "closed" ? "Resolved" : "Open"} · {formatShort(c.lastMessageAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Composer
        color={color}
        value={draft}
        onChange={setDraft}
        onSubmit={submit}
        busy={busy}
        error={error}
        placeholder={conversations.length ? "Start a new conversation…" : "Type your message…"}
      />
    </div>
  );
};

/* ────────────────────────────── Identify ───────────────────────────── */

const IdentifyForm: FC<{
  color: string;
  defaultName: string;
  onSubmit: (who: { name: string; email: string }) => Promise<void>;
}> = ({ color, defaultName, onSubmit }) => {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), email: email.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const field = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400";
  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-3 p-5">
      <p className="text-sm text-gray-700">So we can follow up if you leave, please tell us how to reach you.</p>
      <label className="text-xs font-medium text-gray-600">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} className={cn(field, "mt-1")} autoComplete="name" />
      </label>
      <label className="text-xs font-medium text-gray-600">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(field, "mt-1")}
          autoComplete="email"
          autoFocus
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-60"
        style={{ background: color }}
      >
        {busy ? "Sending…" : "Start chat"}
      </button>
    </form>
  );
};

/* ─────────────────────────────── Thread ────────────────────────────── */

const Thread: FC<{ conversationId: string; token: string; color: string; csatEnabled: boolean }> = ({
  conversationId,
  token,
  color,
  csatEnabled,
}) => {
  const [conversation, setConversation] = useState<WidgetConversation | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ratingHidden, setRatingHidden] = useState(() => wasRatingDismissed(conversationId));
  const bottom = useRef<HTMLDivElement>(null);
  const lastAgentId = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await widgetRequest<{ conversation: WidgetConversation; messages: WidgetMessage[] }>(
        `/conversations/${conversationId}`,
        { token },
      );
      setConversation(data.conversation);
      setMessages((current) => {
        const pending = current.filter((m) => m.pending || m.failed);
        return [...data.messages, ...pending];
      });
      const latestAgent = [...data.messages].reverse().find((m) => m.senderType === "agent");
      if (latestAgent && lastAgentId.current && latestAgent.id !== lastAgentId.current) notifyUnread();
      if (latestAgent) lastAgentId.current = latestAgent.id;
    } catch {
      /* transient — the next poll retries */
    }
  }, [conversationId, token]);

  useEffect(() => {
    void load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_THREAD_MS);
    // Live updates over the API's built-in stream; polling above is the safety net.
    const realtime = createStreamClient(
      {
        ticketEndpoint: `${config.apiUri}/api/v1/realtime/ticket`,
        streamEndpoint: `${config.apiUri}/api/v1/realtime/stream`,
      },
      () => token,
    );
    const unsubscribe = realtime.subscribe(`private-conversation-${conversationId}`, () => void load());
    return () => {
      clearInterval(id);
      unsubscribe();
    };
  }, [load, conversationId, token]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = async (text: string, tempId = `tmp-${Date.now()}`, attachments: Attachment[] = []) => {
    const optimistic: WidgetMessage = {
      id: tempId,
      conversationId,
      senderType: "customer",
      senderName: null,
      senderAvatarUrl: null,
      content: text,
      attachments,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((list) => [...list.filter((m) => m.id !== tempId), optimistic]);
    try {
      const saved = await widgetRequest<WidgetMessage>(`/conversations/${conversationId}/messages`, {
        method: "POST",
        token,
        body: { content: text, attachments },
      });
      setMessages((list) => list.map((m) => (m.id === tempId ? saved : m)));
      // A customer writing back reopens a resolved conversation.
      setConversation((c) => (c && (c.status === "resolved" || c.status === "closed") ? { ...c, status: "open" } : c));
    } catch {
      setMessages((list) => list.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
    }
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void send(text);
  };

  const rate = async (score: number, comment: string) => {
    const updated = await widgetRequest<WidgetConversation>(`/conversations/${conversationId}/rating`, {
      method: "POST",
      token,
      body: { score, comment: comment || null },
    });
    setConversation(updated);
    dismissRating(conversationId);
  };

  const finished = conversation?.status === "resolved" || conversation?.status === "closed";
  const showRating = csatEnabled && finished && conversation?.csatScore === null && !ratingHidden;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {!conversation && <div className="h-10 w-2/3 animate-pulse rounded-xl bg-gray-100" />}
        {messages.map((m) => (
          <Bubble
            key={m.id}
            message={m}
            color={color}
            onRetry={() => void send(m.content, m.id, m.attachments ?? [])}
          />
        ))}
        {finished && (
          <p className="py-1 text-center text-xs text-gray-400">This conversation was resolved. Reply to reopen it.</p>
        )}
        {showRating && (
          <RatingPrompt
            color={color}
            onSubmit={rate}
            onDismiss={() => {
              dismissRating(conversationId);
              setRatingHidden(true);
            }}
          />
        )}
        <div ref={bottom} />
      </div>
      <Composer
        color={color}
        value={draft}
        onChange={setDraft}
        onSubmit={submit}
        placeholder="Write a reply…"
        busy={uploading}
        onAttach={(file) => {
          setUploading(true);
          uploadFile(file, token)
            .then((attachment) => send("", undefined, [attachment]))
            .catch((error: unknown) =>
              setUploadError(error instanceof Error ? error.message : "Couldn't upload that file"),
            )
            .finally(() => setUploading(false));
        }}
        error={uploadError}
      />
    </div>
  );
};

/* ────────────────────────────── Composer ───────────────────────────── */

const Composer: FC<{
  color: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
  placeholder: string;
  busy?: boolean;
  error?: string | null;
  onAttach?: (file: File) => void;
}> = ({ color, value, onChange, onSubmit, placeholder, busy, error, onAttach }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };
  return (
    <form onSubmit={onSubmit} className="shrink-0 border-t border-gray-100 p-3">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex items-end gap-2 rounded-2xl border border-gray-200 px-3 py-2 focus-within:border-gray-400">
        {onAttach && (
          <>
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAttach(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              aria-label="Attach a file"
              className="mb-0.5 shrink-0 text-gray-400 transition hover:text-gray-700 disabled:opacity-40"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
          </>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={5000}
          placeholder={placeholder}
          aria-label="Message"
          className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent py-0.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={!value.trim() || busy}
          aria-label="Send"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-40"
          style={{ background: color }}
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default WidgetPage;
