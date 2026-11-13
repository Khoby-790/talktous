import { gql } from "@apollo/client";

export const ORGANIZATION_FIELDS = gql`
  fragment OrganizationFields on Organization {
    id
    name
    slug
    industry
    website
    logoUrl
    timezone
    plan
    billingStatus
    trialEndsAt
    access {
      locked
      reason
      endsAt
    }
    onboardedAt
    createdAt
    settings {
      autoAssign
      csatEnabled
      slaFirstResponseMinutes
      passwordMinLength
      sessionHours
      aiEnabled
    }
  }
`;

export const AGENT_FIELDS = gql`
  fragment AgentFields on Agent {
    id
    name
    email
    avatarUrl
    jobTitle
    phone
    role
    status
    pending
    joinedAt
    lastSeenAt
    createdAt
    assignedAppIds
  }
`;

export const AGENT_STATS_FIELDS = gql`
  fragment AgentStatsFields on AgentStats {
    totalConversations
    openConversations
    resolvedConversations
    avgFirstResponseSeconds
    csatScore
  }
`;

export const CURRENT_USER_FIELDS = gql`
  fragment CurrentUserFields on Agent {
    ...AgentFields
    preferences {
      emailOnAssignment
      emailOnNewConversation
      desktopNotifications
      soundEnabled
      dailyDigest
      theme
      language
      timezone
    }
  }
  ${AGENT_FIELDS}
`;

export const APP_FIELDS = gql`
  fragment AppFields on App {
    id
    name
    description
    type
    status
    publicKey
    secretKeyHint
    createdAt
    updatedAt
    agentIds
    widgetConfig {
      primaryColor
      position
      greeting
      title
      subtitle
      launcherText
      requireEmail
      showAgentAvatars
      allowedOrigins
    }
    channelConfig {
      supportEmail
      fromName
      whatsappPhoneNumberId
      whatsappBusinessAccountId
      whatsappDisplayNumber
      whatsappVerifyToken
      whatsappAccessTokenSet
      whatsappAppSecretSet
      callbackUrl
      callbackSecret
    }
    endpoints {
      widgetScriptUrl
      embedSnippet
      inboundEmailWebhookUrl
      whatsappWebhookUrl
      apiBaseUrl
    }
    stats {
      totalConversations
      openConversations
      resolvedConversations
      avgFirstResponseSeconds
      csatScore
    }
    setup {
      credentialsSaved
      credentialsOk
      credentialsError
      credentialsCheckedAt
      webhookVerifiedAt
      widgetSeenAt
      widgetSeenOrigin
      lastApiCallAt
      lastInboundAt
      firstConversationAt
      agentsAssigned
    }
  }
`;

export const CUSTOMER_FIELDS = gql`
  fragment CustomerFields on Customer {
    id
    name
    email
    phone
    avatarUrl
    externalId
    metadata
    conversationCount
    openConversationCount
    firstSeenAt
    lastSeenAt
    createdAt
  }
`;

export const CONVERSATION_SUMMARY_FIELDS = gql`
  fragment ConversationSummaryFields on Conversation {
    id
    status
    channel
    priority
    subject
    tags
    lastMessageAt
    lastMessagePreview
    lastMessageSenderType
    unreadCount
    firstResponseAt
    resolvedAt
    csatScore
    csatComment
    createdAt
    updatedAt
    appId
    customerId
    assignedAgentId
    customer {
      id
      name
      email
      avatarUrl
    }
    assignedAgent {
      id
      name
      avatarUrl
      status
    }
    app {
      id
      name
      type
    }
  }
`;

export const MESSAGE_FIELDS = gql`
  fragment MessageFields on Message {
    id
    conversationId
    senderType
    senderId
    isInternal
    content
    deliveryStatus
    aiAssisted
    createdAt
    attachments {
      url
      name
      contentType
      size
    }
    sender {
      id
      name
      avatarUrl
    }
  }
`;

export const INTEGRATION_FIELDS = gql`
  fragment IntegrationFields on Integration {
    provider
    id
    name
    description
    category
    docsUrl
    connected
    status
    config
    events
    lastError
    lastDeliveredAt
    connectedAt
    availableOnPlan
    signingSecret
    fields {
      key
      label
      type
      required
      placeholder
      help
    }
  }
`;

export const PLAN_FIELDS = gql`
  fragment PlanFields on PlanInfo {
    id
    name
    priceMonthly
    price {
      amount
      currency
      interval
    }
    seatLimit
    appLimit
    conversationLimit
    integrations
    whatsapp
    aiRequestsPerMonth
    features
  }
`;
