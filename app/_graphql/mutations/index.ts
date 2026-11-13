import { gql } from "@apollo/client";
import {
  AGENT_FIELDS,
  APP_FIELDS,
  CONVERSATION_SUMMARY_FIELDS,
  CURRENT_USER_FIELDS,
  CUSTOMER_FIELDS,
  INTEGRATION_FIELDS,
  MESSAGE_FIELDS,
  ORGANIZATION_FIELDS,
} from "../fragments";

/* ── Auth ────────────────────────────────────────────────────────────── */
const AUTH_PAYLOAD = gql`
  fragment AuthPayloadFields on AuthPayload {
    token
    user {
      ...CurrentUserFields
    }
    organization {
      ...OrganizationFields
    }
  }
  ${CURRENT_USER_FIELDS}
  ${ORGANIZATION_FIELDS}
`;

export const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      ...AuthPayloadFields
    }
  }
  ${AUTH_PAYLOAD}
`;

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      ...AuthPayloadFields
    }
  }
  ${AUTH_PAYLOAD}
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      ...AuthPayloadFields
    }
  }
  ${AUTH_PAYLOAD}
`;

export const ACCEPT_INVITE = gql`
  mutation AcceptInvite($input: AcceptInviteInput!) {
    acceptInvite(input: $input) {
      ...AuthPayloadFields
    }
  }
  ${AUTH_PAYLOAD}
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

/* ── Organization ────────────────────────────────────────────────────── */
export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      ...OrganizationFields
    }
  }
  ${ORGANIZATION_FIELDS}
`;

export const UPDATE_ORGANIZATION_SETTINGS = gql`
  mutation UpdateOrganizationSettings($input: OrganizationSettingsInput!) {
    updateOrganizationSettings(input: $input) {
      ...OrganizationFields
    }
  }
  ${ORGANIZATION_FIELDS}
`;

export const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      ...OrganizationFields
    }
  }
  ${ORGANIZATION_FIELDS}
`;

/* ── Agents ──────────────────────────────────────────────────────────── */
export const INVITE_AGENT = gql`
  mutation InviteAgent($input: InviteAgentInput!) {
    inviteAgent(input: $input) {
      inviteUrl
      emailSent
      agent {
        ...AgentFields
      }
    }
  }
  ${AGENT_FIELDS}
`;

export const RESEND_INVITE = gql`
  mutation ResendInvite($id: ID!) {
    resendInvite(id: $id) {
      inviteUrl
      emailSent
      agent {
        ...AgentFields
      }
    }
  }
  ${AGENT_FIELDS}
`;

export const UPDATE_AGENT = gql`
  mutation UpdateAgent($id: ID!, $input: UpdateAgentInput!) {
    updateAgent(id: $id, input: $input) {
      ...AgentFields
    }
  }
  ${AGENT_FIELDS}
`;

export const REMOVE_AGENT = gql`
  mutation RemoveAgent($id: ID!) {
    removeAgent(id: $id)
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...CurrentUserFields
    }
  }
  ${CURRENT_USER_FIELDS}
`;

export const UPDATE_PREFERENCES = gql`
  mutation UpdatePreferences($input: PreferencesInput!) {
    updatePreferences(input: $input) {
      ...CurrentUserFields
    }
  }
  ${CURRENT_USER_FIELDS}
`;

export const SET_STATUS = gql`
  mutation SetStatus($status: AgentStatus!) {
    setStatus(status: $status) {
      ...CurrentUserFields
    }
  }
  ${CURRENT_USER_FIELDS}
`;

/* ── Apps ────────────────────────────────────────────────────────────── */
export const CREATE_APP = gql`
  mutation CreateApp($input: CreateAppInput!) {
    createApp(input: $input) {
      secretKey
      app {
        ...AppFields
      }
    }
  }
  ${APP_FIELDS}
`;

export const UPDATE_APP = gql`
  mutation UpdateApp($id: ID!, $input: UpdateAppInput!) {
    updateApp(id: $id, input: $input) {
      ...AppFields
    }
  }
  ${APP_FIELDS}
`;

export const DELETE_APP = gql`
  mutation DeleteApp($id: ID!) {
    deleteApp(id: $id)
  }
`;

export const REGENERATE_APP_SECRET = gql`
  mutation RegenerateAppSecret($id: ID!) {
    regenerateAppSecret(id: $id) {
      secretKey
      app {
        ...AppFields
      }
    }
  }
  ${APP_FIELDS}
`;

/* ── Customers ───────────────────────────────────────────────────────── */
export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: UpdateCustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      ...CustomerFields
    }
  }
  ${CUSTOMER_FIELDS}
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

/* ── Conversations ───────────────────────────────────────────────────── */
export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      ...MessageFields
    }
  }
  ${MESSAGE_FIELDS}
`;

export const ASSIGN_CONVERSATION = gql`
  mutation AssignConversation($id: ID!, $agentId: ID) {
    assignConversation(id: $id, agentId: $agentId) {
      ...ConversationSummaryFields
    }
  }
  ${CONVERSATION_SUMMARY_FIELDS}
`;

export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($id: ID!, $input: UpdateConversationInput!) {
    updateConversation(id: $id, input: $input) {
      ...ConversationSummaryFields
    }
  }
  ${CONVERSATION_SUMMARY_FIELDS}
`;

export const MARK_CONVERSATION_READ = gql`
  mutation MarkConversationRead($id: ID!) {
    markConversationRead(id: $id) {
      id
      unreadCount
    }
  }
`;

/* ── Integrations ────────────────────────────────────────────────────── */
export const CONNECT_INTEGRATION = gql`
  mutation ConnectIntegration($input: ConnectIntegrationInput!) {
    connectIntegration(input: $input) {
      ...IntegrationFields
    }
  }
  ${INTEGRATION_FIELDS}
`;

export const DISCONNECT_INTEGRATION = gql`
  mutation DisconnectIntegration($provider: IntegrationProvider!) {
    disconnectIntegration(provider: $provider) {
      ...IntegrationFields
    }
  }
  ${INTEGRATION_FIELDS}
`;

export const TEST_INTEGRATION = gql`
  mutation TestIntegration($provider: IntegrationProvider!) {
    testIntegration(provider: $provider) {
      ok
      statusCode
      error
    }
  }
`;

/* ── Billing ─────────────────────────────────────────────────────────── */
export const CHANGE_PLAN = gql`
  mutation ChangePlan($plan: Plan!) {
    changePlan(plan: $plan) {
      checkoutUrl
      organization {
        ...OrganizationFields
      }
    }
  }
  ${ORGANIZATION_FIELDS}
`;

export const CREATE_BILLING_PORTAL_SESSION = gql`
  mutation CreateBillingPortalSession {
    createBillingPortalSession
  }
`;

export const TEST_APP_CONNECTION = gql`
  mutation TestAppConnection($id: ID!) {
    testAppConnection(id: $id) {
      ok
      message
    }
  }
`;

/* ── AI assist ───────────────────────────────────────────────────────── */
export const AI_DRAFT_REPLY = gql`
  mutation AiDraftReply($conversationId: ID!, $instruction: String) {
    aiDraftReply(conversationId: $conversationId, instruction: $instruction) {
      text
      draftId
    }
  }
`;

export const AI_SUMMARIZE = gql`
  mutation AiSummarize($conversationId: ID!, $refresh: Boolean) {
    aiSummarize(conversationId: $conversationId, refresh: $refresh) {
      text
      generatedAt
      stale
    }
  }
`;

export const AI_REWRITE = gql`
  mutation AiRewrite($text: String!, $style: AiRewriteStyle!, $language: String, $conversationId: ID) {
    aiRewrite(text: $text, style: $style, language: $language, conversationId: $conversationId) {
      text
    }
  }
`;

export const SET_AI_ENABLED = gql`
  mutation SetAiEnabled($enabled: Boolean!) {
    setAiEnabled(enabled: $enabled) {
      ...OrganizationFields
    }
  }
  ${ORGANIZATION_FIELDS}
`;

const AI_STATUS_FIELDS = `
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
`;

export const SAVE_AI_PROVIDER = gql`
  mutation SaveAiProvider($input: AiProviderInput!) {
    saveAiProvider(input: $input) {
      ${AI_STATUS_FIELDS}
    }
  }
`;

export const REMOVE_AI_PROVIDER = gql`
  mutation RemoveAiProvider {
    removeAiProvider {
      ${AI_STATUS_FIELDS}
    }
  }
`;

export const TEST_AI_PROVIDER = gql`
  mutation TestAiProvider {
    testAiProvider {
      ok
      message
    }
  }
`;

export const AI_MODELS = gql`
  mutation AiModels($input: AiModelsInput!) {
    aiModels(input: $input) {
      id
      name
    }
  }
`;
