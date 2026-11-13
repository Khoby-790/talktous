import { gql } from "@apollo/client";
import {
  AGENT_FIELDS,
  AGENT_STATS_FIELDS,
  APP_FIELDS,
  CONVERSATION_SUMMARY_FIELDS,
  CURRENT_USER_FIELDS,
  CUSTOMER_FIELDS,
  INTEGRATION_FIELDS,
  KNOWLEDGE_PASSAGE_FIELDS,
  KNOWLEDGE_SOURCE_FIELDS,
  MESSAGE_FIELDS,
  ORGANIZATION_FIELDS,
  PLAN_FIELDS,
} from "../fragments";

/* ── Session ─────────────────────────────────────────────────────────── */
export const ME = gql`
  query Me {
    me {
      user {
        ...CurrentUserFields
      }
      organization {
        ...OrganizationFields
      }
    }
  }
  ${CURRENT_USER_FIELDS}
  ${ORGANIZATION_FIELDS}
`;

export const INVITATION = gql`
  query Invitation($token: String!) {
    invitation(token: $token) {
      email
      name
      role
      organizationName
      invitedByName
    }
  }
`;

export const REALTIME_CONFIG = gql`
  query RealtimeConfig {
    realtimeConfig {
      enabled
      provider
      key
      cluster
      authEndpoint
      ticketEndpoint
      streamEndpoint
    }
  }
`;

/* ── Organization ────────────────────────────────────────────────────── */
export const ORGANIZATION = gql`
  query Organization {
    organization {
      ...OrganizationFields
    }
  }
  ${ORGANIZATION_FIELDS}
`;

/* ── Dashboard ───────────────────────────────────────────────────────── */
export const DASHBOARD_STATS = gql`
  query DashboardStats($rangeDays: Int) {
    dashboardStats(rangeDays: $rangeDays) {
      rangeDays
      scope
      openConversations
      pendingConversations
      unassignedConversations
      agentsOnline
      agentsTotal
      newConversations
      newConversationsPrevious
      resolvedConversations
      resolvedConversationsPrevious
      avgFirstResponseSeconds
      avgFirstResponseSecondsPrevious
      avgResolutionSeconds
      avgResolutionSecondsPrevious
      csatScore
      csatScorePrevious
      csatResponses
      volume {
        date
        created
        resolved
      }
      channels {
        channel
        count
      }
      topAgents {
        resolved
        avgFirstResponseSeconds
        csatScore
        agent {
          id
          name
          avatarUrl
          status
          role
        }
      }
    }
  }
`;

export const RECENT_ACTIVITY = gql`
  query RecentActivity($limit: Int) {
    recentActivity(limit: $limit) {
      id
      type
      actorType
      actorId
      actorName
      conversationId
      summary
      data
      createdAt
    }
  }
`;

/* ── Agents ──────────────────────────────────────────────────────────── */
export const AGENTS = gql`
  query Agents($filter: AgentFilter, $pagination: Pagination) {
    agents(filter: $filter, pagination: $pagination) {
      total
      items {
        ...AgentFields
        stats {
          ...AgentStatsFields
        }
      }
    }
  }
  ${AGENT_FIELDS}
  ${AGENT_STATS_FIELDS}
`;

export const AGENT = gql`
  query Agent($id: ID!) {
    agent(id: $id) {
      ...AgentFields
      stats {
        ...AgentStatsFields
      }
      assignedApps {
        id
        name
        type
        status
      }
    }
  }
  ${AGENT_FIELDS}
  ${AGENT_STATS_FIELDS}
`;

/* ── Apps ────────────────────────────────────────────────────────────── */
export const APPS = gql`
  query Apps($filter: AppFilter, $pagination: Pagination) {
    apps(filter: $filter, pagination: $pagination) {
      total
      items {
        ...AppFields
      }
    }
  }
  ${APP_FIELDS}
`;

export const APP = gql`
  query App($id: ID!) {
    app(id: $id) {
      ...AppFields
      agents {
        ...AgentFields
      }
    }
  }
  ${APP_FIELDS}
  ${AGENT_FIELDS}
`;

/* ── Customers ───────────────────────────────────────────────────────── */
export const CUSTOMERS = gql`
  query Customers($filter: CustomerFilter, $pagination: Pagination, $sort: CustomerSort) {
    customers(filter: $filter, pagination: $pagination, sort: $sort) {
      total
      items {
        ...CustomerFields
      }
    }
  }
  ${CUSTOMER_FIELDS}
`;

export const CUSTOMER = gql`
  query Customer($id: ID!) {
    customer(id: $id) {
      ...CustomerFields
    }
  }
  ${CUSTOMER_FIELDS}
`;

/* ── Conversations ───────────────────────────────────────────────────── */
export const CONVERSATIONS = gql`
  query Conversations($filter: ConversationFilter, $pagination: Pagination, $sort: ConversationSort) {
    conversations(filter: $filter, pagination: $pagination, sort: $sort) {
      total
      items {
        ...ConversationSummaryFields
      }
    }
  }
  ${CONVERSATION_SUMMARY_FIELDS}
`;

export const CONVERSATION = gql`
  query Conversation($id: ID!, $limit: Int, $before: DateTime) {
    conversation(id: $id) {
      ...ConversationSummaryFields
      customer {
        ...CustomerFields
      }
      aiSummary {
        text
        generatedAt
        stale
      }
      messages(limit: $limit, before: $before) {
        hasMore
        items {
          ...MessageFields
        }
      }
    }
  }
  ${CONVERSATION_SUMMARY_FIELDS}
  ${CUSTOMER_FIELDS}
  ${MESSAGE_FIELDS}
`;

export const INBOX_COUNTS = gql`
  query InboxCounts {
    inboxCounts {
      open
      pending
      mine
      unassigned
      resolved
    }
  }
`;

export const CONVERSATION_TAGS = gql`
  query ConversationTags {
    conversationTags
  }
`;

/* ── Integrations ────────────────────────────────────────────────────── */
export const INTEGRATIONS = gql`
  query Integrations {
    integrations {
      ...IntegrationFields
    }
    integrationEventTypes
  }
  ${INTEGRATION_FIELDS}
`;

/* ── Billing ─────────────────────────────────────────────────────────── */
export const BILLING = gql`
  query Billing {
    billing {
      plan
      billingStatus
      currentPeriodEnd
      trialEndsAt
      trialDays
      trialAvailable
      paymentsEnabled
      hasSubscription
      cardOnFile
      cancelsAtPeriodEnd
      cardCheck {
        amount
        currency
      }
      access {
        locked
        reason
        endsAt
      }
      overLimit
      usage {
        seats
        apps
        conversationsThisMonth
      }
      limits {
        ...PlanFields
      }
      plans {
        ...PlanFields
      }
    }
  }
  ${PLAN_FIELDS}
`;

export const PRICING = gql`
  query Pricing {
    pricing {
      trialDays
      plans {
        ...PlanFields
      }
    }
  }
  ${PLAN_FIELDS}
`;

/* ── Setup guidance ──────────────────────────────────────────────────── */
export const ENVIRONMENT = gql`
  query Environment {
    environment {
      apiPublicUrl
      apiPublicUrlIsLocal
      appUrl
      mailConfigured
      billingConfigured
      realtimeProvider
      whatsappSignup {
        appId
        configId
        graphVersion
      }
      inboundEmailDomain
    }
  }
`;

export const GETTING_STARTED = gql`
  query GettingStarted {
    gettingStarted {
      channelCreated
      channelReceivedMessage
      teammateInvited
      firstReplySent
      integrationConnected
      brandingAdded
      emailSendingConfigured
    }
  }
`;

/* ── AI assist ───────────────────────────────────────────────────────── */
export const AI_STATUS = gql`
  query AiStatus {
    aiStatus {
      configured
      enabled
      available
      provider
      model
      baseUrl
      apiKeyLast4
      verifiedAt
      lastError
      usedThisMonth
      limit
      draftsGenerated
      draftsSentUnchanged
      draftsSentEdited
      autoRepliesSent
      autoReplyHandoffs
    }
  }
`;

export const AI_PROVIDERS = gql`
  query AiProviders {
    aiProviders {
      id
      name
      keyUrl
      keyHint
      needsBaseUrl
    }
  }
`;

/* ── Knowledge base ─────────────────────────────────────────────────── */
export const KNOWLEDGE_SOURCES = gql`
  query KnowledgeSources {
    knowledgeSources {
      ...KnowledgeSourceFields
    }
  }
  ${KNOWLEDGE_SOURCE_FIELDS}
`;

export const KNOWLEDGE_SOURCE = gql`
  query KnowledgeSource($id: ID!) {
    knowledgeSource(id: $id) {
      ...KnowledgeSourceFields
      content
    }
  }
  ${KNOWLEDGE_SOURCE_FIELDS}
`;

export const SEARCH_KNOWLEDGE = gql`
  query SearchKnowledge($query: String!) {
    searchKnowledge(query: $query) {
      ...KnowledgePassageFields
    }
  }
  ${KNOWLEDGE_PASSAGE_FIELDS}
`;

/* ── Insights ───────────────────────────────────────────────────────── */
export const INSIGHTS = gql`
  query Insights($rangeDays: Int) {
    insights(rangeDays: $rangeDays) {
      rangeDays
      conversations
      previousConversations
      triaged
      negative
      answeredByAi
      handedOffByAi
      topics {
        tag
        count
        previous
        negative
        examples
      }
      languages {
        language
        count
      }
      gapCount
      gaps {
        conversationId
        customerName
        question
        intent
        source
        at
      }
    }
  }
`;
