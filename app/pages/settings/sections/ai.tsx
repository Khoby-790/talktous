import { type FC, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useReactiveVar } from "@apollo/client/react";
import { BookOpenIcon, BoltIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { currentOrgVar } from "~/_graphql/cache/auth";
import { Toggle } from "~/components/core";
import { PrimaryButton } from "~/components/buttons";
import { SettingsCard } from "~/components/forms/settings";
import { Callout, ExternalLink } from "~/components/guides";
import { ConfirmModal } from "~/components/layouts";
import { Shimmer } from "~/components/shimmer";
import {
  useAiModels,
  useAiProviders,
  useAiStatus,
  useRemoveAiProvider,
  useSaveAiProvider,
  useSetAiEnabled,
  useSetAiTriage,
  useTestAiProvider,
} from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage, getFieldErrors } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatRelative } from "~/utils/date";
import type { AiProviderId, AiStatus } from "~/utils/types";

/** Popular OpenAI-compatible services, so "Other" is one click for most people. */
const COMPATIBLE_PRESETS = [
  { name: "Groq", url: "https://api.groq.com/openai/v1", keyUrl: "https://console.groq.com/keys" },
  { name: "Mistral", url: "https://api.mistral.ai/v1", keyUrl: "https://console.mistral.ai/api-keys" },
  { name: "OpenRouter", url: "https://openrouter.ai/api/v1", keyUrl: "https://openrouter.ai/keys" },
  { name: "Together", url: "https://api.together.xyz/v1", keyUrl: "https://api.together.ai/settings/api-keys" },
  { name: "DeepSeek", url: "https://api.deepseek.com/v1", keyUrl: "https://platform.deepseek.com/api_keys" },
  { name: "Ollama / vLLM (self-hosted)", url: "https://your-server.example.com/v1", keyUrl: "" },
];

const field =
  "h-[42px] w-full rounded-md border border-line bg-field px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15";

/** Connect the organization's own AI provider: provider → key → model → save (verified). */
const ProviderForm: FC<{ status: AiStatus }> = ({ status }) => {
  const { providers } = useAiProviders();
  const { saveProvider, loading: saving } = useSaveAiProvider();
  const { loadModels, loading: loadingModels } = useAiModels();
  const [provider, setProvider] = useState<AiProviderId>(status.provider ?? "anthropic");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(status.baseUrl ?? "");
  const [model, setModel] = useState(status.model ?? "");
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const info = providers.find((p) => p.id === provider);
  const savedKeyUsable = status.provider === provider && Boolean(status.apiKeyLast4);

  // A different provider means a different key, base URL and model list.
  useEffect(() => {
    setModels([]);
    setErrors({});
    if (provider !== status.provider) {
      setModel("");
      setBaseUrl("");
    } else {
      setModel(status.model ?? "");
      setBaseUrl(status.baseUrl ?? "");
    }
  }, [provider, status.provider, status.model, status.baseUrl]);

  const fetchModels = async () => {
    setErrors({});
    try {
      const list = await loadModels({ provider, apiKey: apiKey || null, baseUrl: baseUrl || null });
      setModels(list);
      if (!list.length) toast.info("No models were listed for this key. Type the model name instead.");
      else if (!model || !list.some((m) => m.id === model)) setModel(list[0]!.id);
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
    }
  };

  const save = async () => {
    setErrors({});
    try {
      await saveProvider({ provider, apiKey: apiKey || null, model: model.trim(), baseUrl: baseUrl || null });
      setApiKey("");
      toast.success("Connected — the model answered our test.");
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error));
    }
  };

  const modelOptions = useMemo(
    () => (model && !models.some((m) => m.id === model) ? [{ id: model, name: model }, ...models] : models),
    [model, models],
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">1. Choose your AI provider</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {providers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProvider(p.id)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition",
                provider === p.id
                  ? "border-primary-500 bg-primary-500/8 ring-2 ring-primary-500/20"
                  : "border-line hover:border-line-strong",
              )}
            >
              <p className="text-sm font-medium text-ink">{p.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{p.keyHint}</p>
            </button>
          ))}
        </div>
      </div>

      {info?.needsBaseUrl && (
        <div className="space-y-1.5">
          <label htmlFor="baseUrl" className="text-sm font-medium text-ink-soft">
            2. The service&apos;s API address
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMPATIBLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setBaseUrl(preset.url)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  baseUrl === preset.url ? "bg-primary-600 text-white" : "bg-surface-2 text-ink-soft hover:text-ink",
                )}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <input
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
            className={cn(field, errors.baseUrl && "border-red-400")}
          />
          {errors.baseUrl ? (
            <p className="text-xs text-red-500">{errors.baseUrl}</p>
          ) : (
            <p className="text-xs text-ink-muted">
              Any service that offers an OpenAI-compatible Chat Completions API. Self-hosted servers must be reachable
              from the internet over https.
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="apiKey" className="text-sm font-medium text-ink-soft">
          {info?.needsBaseUrl ? "3." : "2."} Your API key
        </label>
        <input
          id="apiKey"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={savedKeyUsable ? `Saved key ••••${status.apiKeyLast4} — paste a new one to replace it` : "Paste your API key"}
          className={cn(field, errors.apiKey && "border-red-400")}
        />
        {errors.apiKey ? (
          <p className="text-xs text-red-500">{errors.apiKey}</p>
        ) : (
          <p className="text-xs text-ink-muted">
            {info?.keyUrl ? (
              <>
                Create one at <ExternalLink href={info.keyUrl}>{new URL(info.keyUrl).host}</ExternalLink>.{" "}
              </>
            ) : (
              baseUrl && COMPATIBLE_PRESETS.find((p) => p.url === baseUrl)?.keyUrl ? (
                <>
                  Create one at{" "}
                  <ExternalLink href={COMPATIBLE_PRESETS.find((p) => p.url === baseUrl)!.keyUrl}>
                    {new URL(COMPATIBLE_PRESETS.find((p) => p.url === baseUrl)!.keyUrl).host}
                  </ExternalLink>
                  .{" "}
                </>
              ) : null
            )}
            Usage is billed to your account with them. We store the key encrypted and never show it again.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="model" className="text-sm font-medium text-ink-soft">
          {info?.needsBaseUrl ? "4." : "3."} Model
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          {modelOptions.length > 0 ? (
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={cn(field, "sm:flex-1")}
            >
              {modelOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name === m.id ? m.id : `${m.name} (${m.id})`}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Load the list, or type the model name"
              className={cn(field, "sm:flex-1", errors.model && "border-red-400")}
            />
          )}
          <PrimaryButton
            variant="secondary"
            onClick={() => void fetchModels()}
            loading={loadingModels}
            disabled={!apiKey && !savedKeyUsable}
            className="h-[42px]"
          >
            Load models
          </PrimaryButton>
        </div>
        <p className="text-xs text-ink-muted">
          Lists the models your key can use. A capable, fast model works best for drafting replies.
        </p>
      </div>

      <div className="flex justify-end border-t border-line pt-4">
        <PrimaryButton onClick={() => void save()} loading={saving} disabled={!model.trim() || (!apiKey && !savedKeyUsable)}>
          {!saving && <CheckCircleIcon className="h-4 w-4" />} {status.configured ? "Save changes" : "Connect"}
        </PrimaryButton>
      </div>
    </div>
  );
};

/** Automatic triage of new conversations: classify, and optionally set priority and tags. */
const TriageCard: FC<{ available: boolean }> = ({ available }) => {
  const org = useReactiveVar(currentOrgVar);
  const { setAiTriage, loading } = useSetAiTriage();
  const settings = org?.settings.aiTriage ?? { enabled: false, setPriority: true, addTags: true };

  const save = async (next: Partial<typeof settings>, message?: string) => {
    try {
      // Explicit fields: the cached object also carries Apollo's __typename.
      const merged = { ...settings, ...next };
      await setAiTriage({ enabled: merged.enabled, setPriority: merged.setPriority, addTags: merged.addTags });
      if (message) toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <SettingsCard
      title="Auto-triage"
      description="When a conversation starts, your AI reads the first message and labels it — so urgent and upset customers stand out in the inbox."
    >
      <div className="space-y-5">
        {!available && <Callout tone="info">Turn AI assist on above to use auto-triage.</Callout>}
        <Toggle
          id="aiTriage"
          label="Triage new conversations automatically"
          checked={settings.enabled}
          disabled={!available || loading}
          onChange={(value) =>
            void save({ enabled: value }, value ? "New conversations will be triaged" : "Auto-triage is off")
          }
        />
        <ul className="space-y-2.5 text-sm text-ink-soft">
          <li className="flex gap-2.5">
            <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600 dark:text-phosphor" />
            <span>
              Shows the customer&apos;s <strong className="text-ink">language</strong>, whether they&apos;re{" "}
              <strong className="text-ink">upset</strong>, and what they want in a few words.
            </span>
          </li>
        </ul>
        <div className={cn("space-y-3 border-t border-line pt-4", !settings.enabled && "opacity-50")}>
          <Toggle
            id="aiTriagePriority"
            label="Set priority (high or urgent problems go to the top; only while priority is still Normal)"
            checked={settings.setPriority}
            disabled={!available || !settings.enabled || loading}
            onChange={(value) => void save({ setPriority: value })}
          />
          <Toggle
            id="aiTriageTags"
            label="Add topic tags (reusing your existing tags where they fit)"
            checked={settings.addTags}
            disabled={!available || !settings.enabled || loading}
            onChange={(value) => void save({ addTags: value })}
          />
        </div>
        <p className="text-xs text-ink-muted">
          Each new conversation uses one short AI request on your provider. Agents can always change what triage set.
        </p>
      </div>
    </SettingsCard>
  );
};

/** Settings → AI: bring your own AI provider, turn AI assist on, see usage and draft quality. */
export const AiSection: FC = () => {
  const { aiStatus: s, loading } = useAiStatus();
  const { providers } = useAiProviders();
  const { setAiEnabled, loading: saving } = useSetAiEnabled();
  const { testProvider, loading: testing } = useTestAiProvider();
  const { removeProvider, loading: removing } = useRemoveAiProvider();
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!s) return loading ? <Shimmer className="h-64 rounded-2xl" /> : null;

  const toggle = async (enabled: boolean) => {
    try {
      await setAiEnabled(enabled);
      toast.success(enabled ? "AI assist is on for your team" : "AI assist is off");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const test = async () => {
    try {
      const result = await testProvider();
      if (result?.ok) toast.success(result.message);
      else if (result) toast.error(result.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async () => {
    try {
      await removeProvider();
      setConfirmRemove(false);
      setEditing(false);
      toast.success("AI provider disconnected and key deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const providerName = providers.find((p) => p.id === s.provider)?.name ?? s.provider;
  const sent = s.draftsSentUnchanged + s.draftsSentEdited;
  const unchangedRate = sent ? Math.round((s.draftsSentUnchanged / sent) * 100) : null;

  return (
    <div className="space-y-6">
      <SettingsCard
        title="AI provider"
        description="Asotie uses your own AI account. Connect a provider and your team's AI usage is billed to you by them."
      >
        {s.configured && !editing ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Connected to {providerName}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  Model <code className="font-mono text-xs text-ink">{s.model}</code> · key ••••{s.apiKeyLast4}
                  {s.baseUrl && (
                    <>
                      {" "}
                      · <code className="font-mono text-xs">{s.baseUrl}</code>
                    </>
                  )}
                </p>
                {s.verifiedAt && <p className="mt-0.5 text-xs text-ink-muted">Last verified {formatRelative(s.verifiedAt)}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <PrimaryButton size="sm" variant="secondary" onClick={() => void test()} loading={testing}>
                  {!testing && <BoltIcon className="h-4 w-4" />} Test connection
                </PrimaryButton>
                <PrimaryButton size="sm" variant="secondary" onClick={() => setEditing(true)}>
                  Change
                </PrimaryButton>
                <PrimaryButton size="sm" variant="ghost" onClick={() => setConfirmRemove(true)} className="text-red-600">
                  Disconnect
                </PrimaryButton>
              </div>
            </div>
            {s.lastError && (
              <Callout tone="error" title="The last request failed">
                {s.lastError}
              </Callout>
            )}
          </div>
        ) : (
          <>
            <ProviderForm status={s} />
            {editing && (
              <button type="button" onClick={() => setEditing(false)} className="mt-2 text-xs text-ink-muted hover:text-ink">
                Cancel
              </button>
            )}
          </>
        )}
      </SettingsCard>

      <SettingsCard
        title="AI assist"
        description="Help your agents reply faster. AI writes drafts and summaries — your team always reviews and sends."
      >
        <div className="space-y-5">
          {!s.configured && <Callout tone="info">Connect an AI provider above first, then turn AI assist on.</Callout>}
          <Toggle
            id="aiEnabled"
            label="Turn on AI assist for my team"
            checked={s.enabled}
            disabled={!s.configured || saving}
            onChange={(value) => void toggle(value)}
          />
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li className="flex gap-2.5">
              <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600 dark:text-phosphor" />
              <span>
                <strong className="text-ink">Draft reply</strong> — one click writes a reply from the conversation. Agents
                can add guidance like “offer a discount”. Missing facts become placeholders like [check order status], never
                guesses.
              </span>
            </li>
            <li className="flex gap-2.5">
              <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600 dark:text-phosphor" />
              <span>
                <strong className="text-ink">Rewrite</strong> — make a reply friendlier, shorter or more formal, fix spelling,
                or translate it into the customer&apos;s language.
              </span>
            </li>
            <li className="flex gap-2.5">
              <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600 dark:text-phosphor" />
              <span>
                <strong className="text-ink">Summary</strong> — a three-line recap next to the conversation, for whoever picks
                it up.
              </span>
            </li>
            <li className="flex gap-2.5">
              <BookOpenIcon className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600 dark:text-phosphor" />
              <span>
                <strong className="text-ink">Knowledge base</strong> — drafts quote your own FAQs, policies and help pages, and
                show their sources.{" "}
                <Link to="/knowledge" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
                  Add knowledge
                </Link>
              </span>
            </li>
          </ul>
        </div>
      </SettingsCard>

      <TriageCard available={s.available} />

      <SettingsCard title="This month">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "AI requests", value: String(s.usedThisMonth), hint: "Drafts, rewrites and summaries" },
            { label: "Drafts written", value: String(s.draftsGenerated), hint: `${sent} sent by agents` },
            {
              label: "Sent without edits",
              value: unchangedRate === null ? "—" : `${unchangedRate}%`,
              hint: "How often agents send a draft exactly as written",
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line p-4">
              <p className="label-caps text-ink-muted">{stat.label}</p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-figure">{stat.value}</p>
              <p className="mt-1 text-xs text-ink-muted">{stat.hint}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-muted">
          “Sent without edits” tells you how good the drafts are for your business. When it&apos;s consistently high,
          you&apos;re ready to let AI answer simple questions on its own.
        </p>
      </SettingsCard>

      <SettingsCard title="Your data">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>
            When an agent uses AI, that conversation (messages, internal notes, customer name and details) is sent to the
            provider you connected{providerName ? ` (${providerName})` : ""}, under your own agreement with them.
          </li>
          <li>Check your provider&apos;s data-retention and training settings — they apply to these requests.</li>
          <li>Your API key is stored encrypted and is never shown again or sent to anyone else.</li>
          <li>Nothing is sent unless an agent clicks an AI button. Turning AI off or disconnecting stops it immediately.</li>
        </ul>
      </SettingsCard>

      <ConfirmModal
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={remove}
        loading={removing}
        title="Disconnect AI provider?"
        confirmLabel="Disconnect"
        description="Your API key will be deleted and AI assist turned off for everyone. You can connect again any time."
      />
    </div>
  );
};
