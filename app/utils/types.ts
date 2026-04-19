export type AgentRole = "admin" | "supervisor" | "agent";
export type AgentStatus = "online" | "offline" | "busy" | "away";
export type PlanType = "starter" | "growth" | "enterprise";
export type AppType = "web_widget" | "api" | "email" | "whatsapp";
export type AppStatus = "active" | "inactive" | "draft";
export type ConversationStatus = "open" | "pending" | "resolved" | "closed";
export type ConversationChannel = "web" | "email" | "whatsapp" | "api";
export type ConversationPriority = "low" | "normal" | "high" | "urgent";
export type ThemeType = "light" | "dark";

export type Organization = {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  plan: PlanType;
  timezone: string;
  createdAt: string;
};

export type WidgetConfig = {
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  welcomeMessage: string;
  offlineMessage: string;
};

export type Integration = {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected";
};

export type SupportApp = {
  id: string;
  organizationId: string;
  name: string;
  type: AppType;
  status: AppStatus;
  apiKey: string;
  widgetConfig?: WidgetConfig;
  integrations: Integration[];
  createdAt: string;
};

export type AgentStats = {
  totalConversations: number;
  resolvedConversations: number;
  avgResponseTime: number;
  csatScore: number;
};

export type Agent = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  avatar?: string;
  role: AgentRole;
  status: AgentStatus;
  assignedApps: string[];
  stats: AgentStats;
  createdAt: string;
};

export type AgentUser = Agent & {
  token?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "agent" | "customer";
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  appId: string;
  customerId: string;
  assignedAgentId?: string;
  status: ConversationStatus;
  channel: ConversationChannel;
  priority: ConversationPriority;
  tags: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  phone?: string;
  metadata: Record<string, string>;
  conversationCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type AppConfig = {
  timezone: string;
  language: string;
  theme: ThemeType;
  dateFormat: string;
  pollInterval: number;
};

export type PaginatedResult<T> = {
  rows: T[];
  count: number;
};
