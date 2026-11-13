import config from "~/config";

/** Shapes returned by talktous-api's /api/v1/widget endpoints (widget.broker.ts). */
export type WidgetApp = {
  appId: string;
  name: string;
  status: "active" | "inactive" | "draft";
  organizationName: string;
  organizationLogoUrl: string | null;
  config: {
    title?: string;
    subtitle?: string;
    greeting?: string;
    primaryColor?: string;
    requireEmail?: boolean;
    showAgentAvatars?: boolean;
  };
  agentsOnline: number;
  /** Older API versions omit it; treat missing as enabled. */
  csatEnabled?: boolean;
  agents: { name: string; avatarUrl: string | null }[];
};

export type WidgetCustomer = { id: string; name: string; email: string | null };

export type WidgetConversation = {
  id: string;
  status: "open" | "pending" | "resolved" | "closed";
  subject: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  csatScore: number | null;
  createdAt: string;
};

export type WidgetMessage = {
  id: string;
  conversationId: string;
  senderType: "customer" | "agent" | "system" | "bot";
  senderName: string | null;
  senderAvatarUrl: string | null;
  content: string;
  attachments?: { url: string; name: string; contentType: string | null; size: number | null }[];
  createdAt: string;
  /** Client-only: optimistic message not yet confirmed by the server. */
  pending?: boolean;
  failed?: boolean;
};

export class WidgetApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const base = `${config.apiUri}/api/v1/widget`;

export const widgetRequest = async <T,>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
    host?: string | null;
    platform?: string | null;
  } = {},
): Promise<T> => {
  const response = await fetch(`${base}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined && { "content-type": "application/json" }),
      ...(options.token && { authorization: `Bearer ${options.token}` }),
      ...(options.host && { "x-widget-host": options.host }),
      ...(options.platform && options.platform !== "web" && { "x-widget-platform": options.platform }),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!response.ok) {
    throw new WidgetApiError(data.error?.message ?? "Something went wrong", response.status);
  }
  return data as T;
};

const storageKey = (publicKey: string) => `ttu:widget:${publicKey}`;

export const readToken = (publicKey: string): string | null => {
  try {
    return localStorage.getItem(storageKey(publicKey));
  } catch {
    return null;
  }
};

export const writeToken = (publicKey: string, token: string | null) => {
  try {
    if (token) localStorage.setItem(storageKey(publicKey), token);
    else localStorage.removeItem(storageKey(publicKey));
  } catch {
    /* storage blocked (third-party iframe) — the session lasts for this page only */
  }
};

const ratedKey = (conversationId: string) => `ttu:widget:rated:${conversationId}`;

export const wasRatingDismissed = (conversationId: string) => {
  try {
    return localStorage.getItem(ratedKey(conversationId)) === "1";
  } catch {
    return false;
  }
};

export const dismissRating = (conversationId: string) => {
  try {
    localStorage.setItem(ratedKey(conversationId), "1");
  } catch {
    /* ignore */
  }
};
