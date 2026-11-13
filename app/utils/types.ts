/**
 * Domain types, mirroring the talktous-api GraphQL schema
 * (talktous-api/src/graphql/schema). Field sets match the fragments in
 * _graphql/fragments.ts; keep the two in step.
 */

export type AgentRole = "admin" | "supervisor" | "agent";
export type AgentStatus = "online" | "offline" | "busy" | "away";
export type PlanType = "starter" | "growth" | "enterprise";
export type BillingStatus = "incomplete" | "active" | "trialing" | "past_due" | "canceled";

export type LockReason = "no_payment" | "trial_ended" | "payment_failed" | "canceled";

/** Whether the team can use the dashboard. Customers' messages always arrive. */
export type BillingAccess = { locked: boolean; reason: LockReason | null; endsAt: string | null };
export type AppType = "web_widget" | "api" | "email" | "whatsapp";
export type AppStatus = "active" | "inactive" | "draft";
export type ConversationStatus = "open" | "pending" | "resolved" | "closed";
export type ConversationChannel = "web" | "email" | "whatsapp" | "api";
export type ConversationPriority = "low" | "normal" | "high" | "urgent";
export type SenderType = "customer" | "agent" | "system" | "bot";
export type IntegrationProvider = "webhook" | "slack" | "zapier" | "discord";
export type ThemeType = "light" | "dark";

export type OrganizationSettings = {
  autoAssign: boolean;
  csatEnabled: boolean;
  slaFirstResponseMinutes: number | null;
  passwordMinLength: number;
  sessionHours: number;
  aiEnabled: boolean;
  /** Automatic AI triage of new conversations. */
  aiTriage: { enabled: boolean; setPriority: boolean; addTags: boolean };
  /** AI first response to customers, from the knowledge base. */
  aiAutoReply: AiAutoReplySettings;
};

export type AiAutoReplySettings = {
  enabled: boolean;
  channels: ConversationChannel[];
  onlyWhenOffline: boolean;
  handoffMessage: string;
};

export type AutoReplyHandoff =
  | "asked_for_person"
  | "not_covered"
  | "needs_person"
  | "limit_reached"
  | "agent_took_over";

/** The AI assistant's part in a conversation. */
export type ConversationAutoReply = {
  replies: number;
  handedOff: boolean;
  reason: AutoReplyHandoff | null;
  at: string;
};

/** What AI triage made of a conversation when it started. */
export type ConversationTriage = {
  language: string;
  sentiment: "positive" | "neutral" | "negative";
  urgency: ConversationPriority;
  intent: string;
  tags: string[];
  appliedPriority: boolean;
  appliedTags: string[];
  at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  timezone: string;
  plan: PlanType;
  billingStatus: BillingStatus;
  trialEndsAt: string | null;
  access: BillingAccess;
  onboardedAt: string | null;
  createdAt: string;
  settings: OrganizationSettings;
};

export type AgentStats = {
  totalConversations: number;
  openConversations: number;
  resolvedConversations: number;
  avgFirstResponseSeconds: number | null;
  csatScore: number | null;
};

export type UserPreferences = {
  emailOnAssignment: boolean;
  emailOnNewConversation: boolean;
  desktopNotifications: boolean;
  soundEnabled: boolean;
  dailyDigest: boolean;
  theme: string;
  language: string;
  timezone: string | null;
};

export type Agent = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  phone: string | null;
  role: AgentRole;
  status: AgentStatus;
  pending: boolean;
  joinedAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  assignedAppIds: string[];
};

export type AgentWithStats = Agent & { stats: AgentStats };

export type AgentDetail = AgentWithStats & {
  assignedApps: Pick<SupportApp, "id" | "name" | "type" | "status">[];
};

/** The signed-in member, as cached in the session. */
export type CurrentUser = Agent & { preferences: UserPreferences | null };
export type CurrentOrg = Organization;

export type WidgetConfig = {
  primaryColor: string;
  position: "left" | "right" | string;
  greeting: string;
  title: string;
  subtitle: string;
  launcherText: string;
  requireEmail: boolean;
  showAgentAvatars: boolean;
  allowedOrigins: string[];
};

export type ChannelConfig = {
  supportEmail: string | null;
  fromName: string | null;
  whatsappPhoneNumberId: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappDisplayNumber: string | null;
  whatsappVerifyToken: string | null;
  whatsappAccessTokenSet: boolean;
  whatsappAppSecretSet: boolean;
  /** "embedded_signup" when connected through Meta's popup; null when set up by hand. */
  whatsappConnectedVia: "embedded_signup" | null;
  callbackUrl: string | null;
  callbackSecret: string | null;
};

export type AppEndpoints = {
  widgetScriptUrl: string;
  embedSnippet: string | null;
  inboundEmailWebhookUrl: string | null;
  whatsappWebhookUrl: string | null;
  apiBaseUrl: string;
};

export type AppStats = {
  totalConversations: number;
  openConversations: number;
  resolvedConversations: number;
  avgFirstResponseSeconds: number | null;
  csatScore: number | null;
};

export type AppSetup = {
  credentialsSaved: boolean;
  credentialsOk: boolean | null;
  credentialsError: string | null;
  credentialsCheckedAt: string | null;
  webhookVerifiedAt: string | null;
  widgetSeenAt: string | null;
  widgetSeenOrigin: string | null;
  lastApiCallAt: string | null;
  lastInboundAt: string | null;
  firstConversationAt: string | null;
  agentsAssigned: boolean;
};

export type Environment = {
  apiPublicUrl: string;
  apiPublicUrlIsLocal: boolean;
  appUrl: string;
  mailConfigured: boolean;
  billingConfigured: boolean;
  realtimeProvider: "stream" | "pusher";
  /** Set when WhatsApp can be connected through Meta's Embedded Signup popup. */
  whatsappSignup: { appId: string; configId: string; graphVersion: string } | null;
};

export type GettingStarted = {
  channelCreated: boolean;
  channelReceivedMessage: boolean;
  teammateInvited: boolean;
  firstReplySent: boolean;
  integrationConnected: boolean;
  brandingAdded: boolean;
  emailSendingConfigured: boolean;
};

export type SupportApp = {
  id: string;
  name: string;
  description: string | null;
  type: AppType;
  status: AppStatus;
  publicKey: string;
  secretKeyHint: string;
  createdAt: string;
  updatedAt: string;
  agentIds: string[];
  widgetConfig: WidgetConfig | null;
  channelConfig: ChannelConfig;
  endpoints: AppEndpoints;
  stats: AppStats;
  setup: AppSetup;
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  externalId: string | null;
  metadata: Record<string, string>;
  conversationCount: number;
  openConversationCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
};

export type Attachment = {
  url: string;
  name: string;
  contentType: string | null;
  size: number | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string | null;
  isInternal: boolean;
  content: string;
  attachments: Attachment[];
  deliveryStatus: "pending" | "sent" | "failed" | null;
  aiAssisted: boolean;
  createdAt: string;
  sender: { id: string | null; name: string; avatarUrl: string | null } | null;
};

export type ConversationSummary = {
  id: string;
  /** Null until triaged. */
  aiTriage: ConversationTriage | null;
  /** Null when the AI assistant never took part. */
  aiAutoReply: ConversationAutoReply | null;
  status: ConversationStatus;
  channel: ConversationChannel;
  priority: ConversationPriority;
  subject: string | null;
  tags: string[];
  lastMessageAt: string;
  lastMessagePreview: string | null;
  lastMessageSenderType: SenderType | null;
  unreadCount: number;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  csatScore: number | null;
  csatComment: string | null;
  createdAt: string;
  updatedAt: string;
  appId: string;
  customerId: string;
  assignedAgentId: string | null;
  customer: Pick<Customer, "id" | "name" | "email" | "avatarUrl">;
  assignedAgent: Pick<Agent, "id" | "name" | "avatarUrl" | "status"> | null;
  app: Pick<SupportApp, "id" | "name" | "type"> | null;
};

/** Kept for older imports: a conversation as listed. */
export type Conversation = ConversationSummary;

export type AiSummary = { text: string | null; generatedAt: string | null; stale: boolean };

export type AiProviderId = "anthropic" | "openai" | "gemini" | "openai_compatible";

export type AiProviderInfo = {
  id: AiProviderId;
  name: string;
  keyUrl: string;
  keyHint: string;
  needsBaseUrl: boolean;
};

export type AiStatus = {
  configured: boolean;
  enabled: boolean;
  available: boolean;
  provider: AiProviderId | null;
  model: string | null;
  baseUrl: string | null;
  apiKeyLast4: string | null;
  verifiedAt: string | null;
  lastError: string | null;
  usedThisMonth: number;
  limit: number | null;
  draftsGenerated: number;
  draftsSentUnchanged: number;
  draftsSentEdited: number;
  autoRepliesSent: number;
  autoReplyHandoffs: number;
};

export type AiRewriteStyle = "friendlier" | "shorter" | "formal" | "fix" | "translate";

export type ConversationDetail = ConversationSummary & {
  customer: Customer;
  aiSummary: AiSummary | null;
  messages: { items: Message[]; hasMore: boolean };
};

export type InboxCounts = {
  open: number;
  pending: number;
  mine: number;
  unassigned: number;
  resolved: number;
};

export type ConversationFilter = {
  status?: ConversationStatus[] | null;
  assignee?: string | null;
  appId?: string | null;
  channel?: ConversationChannel | null;
  priority?: ConversationPriority | null;
  customerId?: string | null;
  tag?: string | null;
  search?: string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
};

export type ConversationSort = "last_message_desc" | "created_desc" | "created_asc" | "priority_desc";

export type DashboardStats = {
  rangeDays: number;
  scope: "organization" | "self";
  openConversations: number;
  pendingConversations: number;
  unassignedConversations: number;
  agentsOnline: number;
  agentsTotal: number;
  newConversations: number;
  newConversationsPrevious: number;
  resolvedConversations: number;
  resolvedConversationsPrevious: number;
  avgFirstResponseSeconds: number | null;
  avgFirstResponseSecondsPrevious: number | null;
  avgResolutionSeconds: number | null;
  avgResolutionSecondsPrevious: number | null;
  csatScore: number | null;
  csatScorePrevious: number | null;
  csatResponses: number;
  volume: { date: string; created: number; resolved: number }[];
  channels: { channel: ConversationChannel; count: number }[];
  topAgents: {
    resolved: number;
    avgFirstResponseSeconds: number | null;
    csatScore: number | null;
    agent: Pick<Agent, "id" | "name" | "avatarUrl" | "status" | "role"> | null;
  }[];
};

export type ActivityEvent = {
  id: string;
  type: string;
  actorType: "agent" | "customer" | "system";
  actorId: string | null;
  actorName: string | null;
  conversationId: string | null;
  summary: string;
  data: Record<string, unknown>;
  createdAt: string;
};

export type IntegrationField = {
  key: string;
  label: string;
  type: "url" | "text" | "secret";
  required: boolean;
  placeholder: string | null;
  help: string | null;
};

export type Integration = {
  provider: IntegrationProvider;
  id: string | null;
  name: string;
  description: string;
  category: "automation" | "messaging" | "developer";
  docsUrl: string | null;
  fields: IntegrationField[];
  connected: boolean;
  status: "connected" | "error" | "disconnected";
  config: Record<string, string>;
  events: string[];
  lastError: string | null;
  lastDeliveredAt: string | null;
  connectedAt: string | null;
  availableOnPlan: boolean;
  signingSecret: string | null;
};

export type PlanInfo = {
  id: PlanType;
  name: string;
  /** USD list price, shown when payments aren't configured. */
  priceMonthly: number;
  /** The Paystack plan's price; null when payments aren't configured or the plan is free. */
  price: { amount: number; currency: string; interval: string } | null;
  seatLimit: number | null;
  appLimit: number | null;
  conversationLimit: number | null;
  integrations: boolean;
  whatsapp: boolean;
  aiRequestsPerMonth: number | null;
  features: string[];
};

export type Billing = {
  plan: PlanType;
  billingStatus: BillingStatus;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  trialDays: number;
  /** Choosing a plan now starts the free trial (card check) instead of charging. */
  trialAvailable: boolean;
  paymentsEnabled: boolean;
  hasSubscription: boolean;
  /** Plan switches during the trial need no payment. */
  cardOnFile: boolean;
  /** Cancelled but usable until currentPeriodEnd. */
  cancelsAtPeriodEnd: boolean;
  /** The refundable charge that verifies a card before the trial. */
  cardCheck: { amount: number; currency: string } | null;
  access: BillingAccess;
  overLimit: boolean;
  usage: { seats: number; apps: number; conversationsThisMonth: number };
  limits: PlanInfo;
  plans: PlanInfo[];
};

export type Invitation = {
  email: string;
  name: string;
  role: AgentRole;
  organizationName: string;
  invitedByName: string | null;
};

export type RealtimeConfig = {
  enabled: boolean;
  provider: "pusher" | "stream";
  key: string | null;
  cluster: string | null;
  authEndpoint: string;
  ticketEndpoint: string;
  streamEndpoint: string;
};

export type Pagination = { limit?: number; offset?: number };
export type ListResult<T> = { items: T[]; total: number };

export type AppConfig = {
  timezone: string;
  language: string;
  theme: ThemeType;
  dateFormat: string;
  pollInterval: number;
};

/* ── Knowledge base ─────────────────────────────────────────────────── */
export type KnowledgeSourceType = "article" | "url" | "file";

export type KnowledgeSource = {
  id: string;
  type: KnowledgeSourceType;
  title: string;
  url: string | null;
  fileName: string | null;
  /** Only on the single-source query. */
  content?: string | null;
  enabled: boolean;
  charCount: number;
  chunkCount: number;
  lastError: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgePassage = {
  sourceId: string;
  title: string;
  url: string | null;
  heading: string | null;
  content: string;
  score: number;
};

export type KnowledgeSourceRef = { id: string; title: string; url: string | null };

export type KnowledgeAnswer = {
  answer: string | null;
  covered: boolean;
  sources: KnowledgeSourceRef[];
  passages: KnowledgePassage[];
};

/** How an AI draft used the knowledge base; null when the AI didn't say. */
export type AiKnowledgeUse = "used" | "not_covered" | "empty" | null;

export type AiDraft = {
  text: string;
  draftId: string;
  knowledge: AiKnowledgeUse;
  sources: KnowledgeSourceRef[];
};

/* ── Insights ───────────────────────────────────────────────────────── */
export type InsightTopic = { tag: string; count: number; previous: number; negative: number; examples: string[] };

export type KnowledgeGap = {
  conversationId: string;
  customerName: string;
  question: string;
  intent: string | null;
  source: "assistant" | "draft";
  at: string;
};

export type Insights = {
  rangeDays: number;
  conversations: number;
  previousConversations: number;
  triaged: number;
  negative: number;
  answeredByAi: number;
  handedOffByAi: number;
  topics: InsightTopic[];
  languages: { language: string; count: number }[];
  gapCount: number;
  gaps: KnowledgeGap[];
};
