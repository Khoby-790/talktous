/**
 * Domain types, mirroring the talktous-api GraphQL schema
 * (talktous-api/src/graphql/schema). Field sets match the fragments in
 * _graphql/fragments.ts; keep the two in step.
 */

export type AgentRole = "admin" | "supervisor" | "agent";
export type AgentStatus = "online" | "offline" | "busy" | "away";
export type PlanType = "starter" | "growth" | "enterprise";
export type BillingStatus = "active" | "trialing" | "past_due" | "canceled";
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
  priceMonthly: number;
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
  stripeEnabled: boolean;
  hasPaymentMethod: boolean;
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
