import type {
  Organization,
  SupportApp,
  Agent,
  Conversation,
  Customer,
} from "~/utils/types";

export const mockOrg: Organization = {
  id: "org_1",
  name: "Acme Corp",
  logo: undefined,
  industry: "Technology",
  plan: "growth",
  timezone: "UTC",
  createdAt: "2024-01-15T08:00:00Z",
};

export const mockUser: Agent = {
  id: "agent_1",
  organizationId: "org_1",
  name: "Alex Johnson",
  email: "alex@acmecorp.com",
  avatar: undefined,
  role: "admin",
  status: "online",
  assignedApps: ["app_1", "app_2"],
  stats: {
    totalConversations: 142,
    resolvedConversations: 130,
    avgResponseTime: 4.2,
    csatScore: 4.7,
  },
  createdAt: "2024-01-15T08:00:00Z",
};

export const mockAgents: Agent[] = [
  mockUser,
  {
    id: "agent_2",
    organizationId: "org_1",
    name: "Maria Santos",
    email: "maria@acmecorp.com",
    role: "supervisor",
    status: "online",
    assignedApps: ["app_1"],
    stats: { totalConversations: 98, resolvedConversations: 91, avgResponseTime: 3.8, csatScore: 4.9 },
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "agent_3",
    organizationId: "org_1",
    name: "James Osei",
    email: "james@acmecorp.com",
    role: "agent",
    status: "busy",
    assignedApps: ["app_2"],
    stats: { totalConversations: 64, resolvedConversations: 58, avgResponseTime: 6.1, csatScore: 4.5 },
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "agent_4",
    organizationId: "org_1",
    name: "Sara Kim",
    email: "sara@acmecorp.com",
    role: "agent",
    status: "away",
    assignedApps: ["app_1", "app_2"],
    stats: { totalConversations: 55, resolvedConversations: 50, avgResponseTime: 5.5, csatScore: 4.6 },
    createdAt: "2024-03-20T11:00:00Z",
  },
  {
    id: "agent_5",
    organizationId: "org_1",
    name: "Tom Baker",
    email: "tom@acmecorp.com",
    role: "agent",
    status: "offline",
    assignedApps: [],
    stats: { totalConversations: 20, resolvedConversations: 17, avgResponseTime: 8.0, csatScore: 4.2 },
    createdAt: "2024-04-01T12:00:00Z",
  },
];

export const mockApps: SupportApp[] = [
  {
    id: "app_1",
    organizationId: "org_1",
    name: "Website Chat Widget",
    type: "web_widget",
    status: "active",
    apiKey: "sk-live-abc123xyz789",
    widgetConfig: {
      primaryColor: "#2563eb",
      position: "bottom-right",
      welcomeMessage: "Hi! How can we help you today?",
      offlineMessage: "We're offline right now. Leave us a message!",
    },
    integrations: [],
    createdAt: "2024-01-20T08:00:00Z",
  },
  {
    id: "app_2",
    organizationId: "org_1",
    name: "Support Email",
    type: "email",
    status: "active",
    apiKey: "sk-live-def456uvw012",
    integrations: [],
    createdAt: "2024-02-10T09:00:00Z",
  },
  {
    id: "app_3",
    organizationId: "org_1",
    name: "WhatsApp Business",
    type: "whatsapp",
    status: "draft",
    apiKey: "sk-live-ghi789rst345",
    integrations: [],
    createdAt: "2024-04-05T10:00:00Z",
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "cust_1",
    organizationId: "org_1",
    name: "David Miller",
    email: "david.miller@email.com",
    phone: "+1 555-0101",
    metadata: { plan: "Pro", company: "Startup Inc." },
    conversationCount: 5,
    firstSeenAt: "2024-02-01T10:00:00Z",
    lastSeenAt: "2024-04-10T14:30:00Z",
  },
  {
    id: "cust_2",
    organizationId: "org_1",
    name: "Lisa Chen",
    email: "lisa.chen@company.com",
    phone: "+1 555-0102",
    metadata: { plan: "Enterprise" },
    conversationCount: 12,
    firstSeenAt: "2024-01-20T09:00:00Z",
    lastSeenAt: "2024-04-18T11:00:00Z",
  },
  {
    id: "cust_3",
    organizationId: "org_1",
    name: "Ahmed Hassan",
    email: "ahmed@business.com",
    metadata: {},
    conversationCount: 2,
    firstSeenAt: "2024-03-15T08:00:00Z",
    lastSeenAt: "2024-04-01T16:00:00Z",
  },
  {
    id: "cust_4",
    organizationId: "org_1",
    name: "Emma Thompson",
    email: "emma.t@example.com",
    phone: "+44 7700 900001",
    metadata: { plan: "Starter" },
    conversationCount: 3,
    firstSeenAt: "2024-03-01T10:00:00Z",
    lastSeenAt: "2024-04-15T09:00:00Z",
  },
  {
    id: "cust_5",
    organizationId: "org_1",
    name: "Carlos Rivera",
    email: "carlos@riverapro.com",
    metadata: {},
    conversationCount: 1,
    firstSeenAt: "2024-04-10T13:00:00Z",
    lastSeenAt: "2024-04-10T13:45:00Z",
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    appId: "app_1",
    customerId: "cust_1",
    assignedAgentId: "agent_2",
    status: "open",
    channel: "web",
    priority: "high",
    tags: ["billing", "urgent"],
    messages: [
      { id: "msg_1", conversationId: "conv_1", senderId: "cust_1", senderType: "customer", content: "Hi, I'm having trouble with my invoice. It seems like I was charged twice this month.", createdAt: "2024-04-18T09:00:00Z" },
      { id: "msg_2", conversationId: "conv_1", senderId: "agent_2", senderType: "agent", content: "Hi David! I'm sorry to hear that. Let me look into your account right away.", createdAt: "2024-04-18T09:05:00Z" },
      { id: "msg_3", conversationId: "conv_1", senderId: "cust_1", senderType: "customer", content: "Thank you! The amount was $149 on April 1st and again on April 15th.", createdAt: "2024-04-18T09:07:00Z" },
    ],
    createdAt: "2024-04-18T09:00:00Z",
    updatedAt: "2024-04-18T09:07:00Z",
  },
  {
    id: "conv_2",
    appId: "app_2",
    customerId: "cust_2",
    assignedAgentId: "agent_1",
    status: "pending",
    channel: "email",
    priority: "normal",
    tags: ["onboarding"],
    messages: [
      { id: "msg_4", conversationId: "conv_2", senderId: "cust_2", senderType: "customer", content: "Hello, I need help setting up the API integration for our enterprise account.", createdAt: "2024-04-17T14:00:00Z" },
      { id: "msg_5", conversationId: "conv_2", senderId: "agent_1", senderType: "agent", content: "Hi Lisa! I'd be happy to help you get the API integration set up. Could you share what programming language you're using?", createdAt: "2024-04-17T14:30:00Z" },
    ],
    createdAt: "2024-04-17T14:00:00Z",
    updatedAt: "2024-04-17T14:30:00Z",
  },
  {
    id: "conv_3",
    appId: "app_1",
    customerId: "cust_3",
    status: "open",
    channel: "web",
    priority: "low",
    tags: [],
    messages: [
      { id: "msg_6", conversationId: "conv_3", senderId: "cust_3", senderType: "customer", content: "Can I change the email address associated with my account?", createdAt: "2024-04-18T10:30:00Z" },
    ],
    createdAt: "2024-04-18T10:30:00Z",
    updatedAt: "2024-04-18T10:30:00Z",
  },
  {
    id: "conv_4",
    appId: "app_1",
    customerId: "cust_4",
    assignedAgentId: "agent_3",
    status: "resolved",
    channel: "web",
    priority: "normal",
    tags: ["password-reset"],
    messages: [
      { id: "msg_7", conversationId: "conv_4", senderId: "cust_4", senderType: "customer", content: "I forgot my password and can't access my account.", createdAt: "2024-04-15T08:00:00Z" },
      { id: "msg_8", conversationId: "conv_4", senderId: "agent_3", senderType: "agent", content: "No worries! I've sent a password reset link to your email address.", createdAt: "2024-04-15T08:10:00Z" },
      { id: "msg_9", conversationId: "conv_4", senderId: "cust_4", senderType: "customer", content: "Got it, thank you so much!", createdAt: "2024-04-15T08:25:00Z" },
    ],
    createdAt: "2024-04-15T08:00:00Z",
    updatedAt: "2024-04-15T08:25:00Z",
  },
  {
    id: "conv_5",
    appId: "app_2",
    customerId: "cust_5",
    status: "open",
    channel: "email",
    priority: "urgent",
    tags: ["bug", "production"],
    messages: [
      { id: "msg_10", conversationId: "conv_5", senderId: "cust_5", senderType: "customer", content: "URGENT: Our integration is down and it's affecting production. We're losing orders!", createdAt: "2024-04-18T11:00:00Z" },
    ],
    createdAt: "2024-04-18T11:00:00Z",
    updatedAt: "2024-04-18T11:00:00Z",
  },
];

export const mockIntegrations: Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: "connected" | "available";
}> = [
  { id: "int_1", name: "Slack", description: "Get notified in Slack when new conversations arrive.", category: "Notifications", icon: "S", status: "connected" },
  { id: "int_2", name: "HubSpot CRM", description: "Sync customer data with HubSpot automatically.", category: "CRM", icon: "H", status: "available" },
  { id: "int_3", name: "Stripe", description: "View customer billing info directly in conversations.", category: "Billing", icon: "St", status: "connected" },
  { id: "int_4", name: "Zendesk", description: "Migrate and sync tickets from Zendesk.", category: "Support", icon: "Z", status: "available" },
  { id: "int_5", name: "Intercom", description: "Import contacts and conversations from Intercom.", category: "Support", icon: "I", status: "available" },
  { id: "int_6", name: "Jira", description: "Create Jira issues directly from conversations.", category: "Project Management", icon: "J", status: "available" },
];

export const mockDashboardStats = {
  openConversations: 3,
  pendingConversations: 1,
  resolvedToday: 8,
  avgResponseTime: "4.2 min",
  csatScore: "4.7",
  agentsOnline: 2,
  totalConversationsThisWeek: 24,
  conversationsByDay: [
    { day: "Mon", count: 4 },
    { day: "Tue", count: 7 },
    { day: "Wed", count: 3 },
    { day: "Thu", count: 6 },
    { day: "Fri", count: 4 },
    { day: "Sat", count: 0 },
    { day: "Sun", count: 0 },
  ],
};
