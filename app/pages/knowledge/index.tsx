import { type FC, type FormEvent, useRef, useState } from "react";
import { Link } from "react-router";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  PencilSquareIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PrimaryButton, primaryButtonVariants } from "~/components/buttons";
import { Card, EmptyState, Spinner, Toggle } from "~/components/core";
import { ConfirmModal, Header, Modal } from "~/components/layouts";
import { CardShimmer } from "~/components/shimmer";
import {
  KNOWLEDGE_FILE_ACCEPT,
  uploadKnowledgeFile,
  useAiStatus,
  useAskKnowledge,
  useDeleteKnowledgeSource,
  useKnowledgeSource,
  useKnowledgeSources,
  useResyncKnowledgeSource,
  useSearchKnowledge,
  useSetKnowledgeSourceEnabled,
} from "~/hooks/data";
import { useDebounce } from "~/hooks/ui/use-debounce";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatRelative } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import { useHasRole } from "~/utils/with-roles";
import type { KnowledgeAnswer, KnowledgeSource } from "~/utils/types";
import ArticleModal from "./article";
import UrlModal from "./url";

export function meta() {
  return [{ title: "Knowledge base — Asotie" }];
}

const TYPE_ICON = { article: DocumentTextIcon, url: GlobeAltIcon, file: PaperClipIcon } as const;
const TYPE_LABEL = { article: "Article", url: "Web page", file: "Document" } as const;

const STARTERS = [
  "Returns, refunds & exchanges",
  "Delivery times & costs",
  "Opening hours & how to reach you",
  "Payment methods (card, mobile money…)",
  "Orders, accounts & passwords",
];

const menuItem =
  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink-soft data-[focus]:bg-surface-2 data-[focus]:text-ink";

/* ─────────────────────────────── Add menu ─────────────────────────────── */

const AddMenu: FC<{ onArticle: () => void; onUrl: () => void; onFile: () => void; uploading: boolean }> = ({
  onArticle,
  onUrl,
  onFile,
  uploading,
}) => (
  <Menu as="div" className="relative">
    <MenuButton disabled={uploading} className={primaryButtonVariants({})}>
      {uploading ? <Spinner className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
      {uploading ? "Reading…" : "Add knowledge"} <ChevronDownIcon className="h-4 w-4" />
    </MenuButton>
    <MenuItems
      anchor="bottom end"
      className="z-50 w-64 rounded-xl border border-[var(--pop-border)] bg-surface p-1.5 shadow-lg outline-none [--anchor-gap:6px]"
    >
      <MenuItem>
        <button type="button" onClick={onArticle} className={menuItem}>
          <DocumentTextIcon className="h-4 w-4" /> Write an article
        </button>
      </MenuItem>
      <MenuItem>
        <button type="button" onClick={onUrl} className={menuItem}>
          <GlobeAltIcon className="h-4 w-4" /> Add a web page
        </button>
      </MenuItem>
      <MenuItem>
        <button type="button" onClick={onFile} className={menuItem}>
          <PaperClipIcon className="h-4 w-4" /> Upload a document
        </button>
      </MenuItem>
      <p className="px-2.5 pb-1 pt-2 text-[11px] text-ink-muted">PDF, Word, text, Markdown, CSV or HTML · up to 10 MB</p>
    </MenuItems>
  </Menu>
);

/* ─────────────────────────────── Source row ─────────────────────────────── */

const SourceRow: FC<{
  source: KnowledgeSource;
  canManage: boolean;
  onOpen: () => void;
  onDelete: () => void;
}> = ({ source, canManage, onOpen, onDelete }) => {
  const Icon = TYPE_ICON[source.type];
  const { setEnabled, loading: toggling } = useSetKnowledgeSourceEnabled();
  const { resync, loading: syncing } = useResyncKnowledgeSource();

  const refresh = async () => {
    try {
      const result = await resync(source.id);
      if (result?.lastError) toast.error(`Couldn't refresh: ${result.lastError}`);
      else toast.success("Page refreshed");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <li className={cn("flex items-start gap-3 px-4 py-3.5 sm:px-5", !source.enabled && "opacity-60")}>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2">
        <Icon className="h-[18px] w-[18px] text-ink-soft" />
      </span>
      <div className="min-w-0 flex-1">
        <button type="button" onClick={onOpen} className="block max-w-full truncate text-left text-sm font-medium text-ink hover:underline">
          {source.title}
        </button>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {TYPE_LABEL[source.type]}
          {source.url && (
            <>
              {" · "}
              <a href={source.url} target="_blank" rel="noreferrer" className="hover:text-ink">
                {source.url.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
          {source.fileName && ` · ${source.fileName}`}
          {` · ${source.charCount.toLocaleString()} characters · updated ${formatRelative(source.lastSyncedAt ?? source.updatedAt)}`}
        </p>
        {source.lastError && (
          <p className="mt-1 flex items-start gap-1 text-xs text-amber-700 dark:text-amber-300">
            <ExclamationTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" />
            Last refresh failed: {source.lastError} The previous version is still used.
          </p>
        )}
      </div>
      {canManage && (
        <div className="flex shrink-0 items-center gap-1">
          <div title={source.enabled ? "AI drafts use this" : "AI drafts ignore this"}>
            <Toggle
              id={`enabled-${source.id}`}
              label=""
              checked={source.enabled}
              disabled={toggling}
              onChange={(value) =>
                void setEnabled(source.id, value).catch((error) => toast.error(getErrorMessage(error)))
              }
            />
          </div>
          <Menu as="div" className="relative">
            <MenuButton
              className="rounded-md p-1.5 text-ink-muted outline-none hover:bg-surface-2 hover:text-ink"
              aria-label={`Actions for ${source.title}`}
            >
              {syncing ? <Spinner className="h-4 w-4" /> : <EllipsisHorizontalIcon className="h-5 w-5" />}
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              className="z-50 w-44 rounded-xl border border-[var(--pop-border)] bg-surface p-1.5 shadow-lg outline-none [--anchor-gap:4px]"
            >
              <MenuItem>
                <button type="button" onClick={onOpen} className={menuItem}>
                  {source.type === "article" ? <PencilSquareIcon className="h-4 w-4" /> : <BookOpenIcon className="h-4 w-4" />}
                  {source.type === "article" ? "Edit" : "View text"}
                </button>
              </MenuItem>
              {source.type === "url" && (
                <MenuItem>
                  <button type="button" onClick={() => void refresh()} className={menuItem}>
                    <ArrowPathIcon className="h-4 w-4" /> Refresh now
                  </button>
                </MenuItem>
              )}
              <MenuItem>
                <button type="button" onClick={onDelete} className={cn(menuItem, "text-red-600 dark:text-red-400")}>
                  <TrashIcon className="h-4 w-4" /> Remove
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      )}
    </li>
  );
};

/* ─────────────────────────────── View text ─────────────────────────────── */

const ViewSourceModal: FC<{ id: string | null; onClose: () => void }> = ({ id, onClose }) => {
  const { source, loading } = useKnowledgeSource(id);
  return (
    <Modal open={Boolean(id)} onClose={onClose} title={source?.title ?? "Source"} size="2xl" loading={loading && !source}>
      {source && (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">
            This is the text the AI reads from this {TYPE_LABEL[source.type].toLowerCase()}.{" "}
            {source.url && (
              <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary-700 hover:underline dark:text-primary-300">
                Open the page <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </a>
            )}
          </p>
          <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-4 font-sans text-sm leading-relaxed text-ink">
            {source.content}
          </pre>
        </div>
      )}
    </Modal>
  );
};

/* ─────────────────────────────── Test panel ─────────────────────────────── */

const TestPanel: FC<{ hasSources: boolean }> = ({ hasSources }) => {
  const [question, setQuestion] = useState("");
  const debounced = useDebounce(question, 350);
  const { passages, loading: searching } = useSearchKnowledge(debounced);
  const { aiStatus } = useAiStatus();
  const { ask, loading: asking } = useAskKnowledge();
  const [answer, setAnswer] = useState<KnowledgeAnswer | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (question.trim().length < 3) return;
    try {
      setAnswer((await ask(question.trim())) ?? null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="p-5">
      <p className="flex items-center gap-1.5 font-medium text-ink">
        <MagnifyingGlassIcon className="h-4 w-4" /> Test your knowledge base
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        Ask what a customer would. You&apos;ll see what the AI would read{aiStatus?.available ? ", and how it would answer" : ""}.
      </p>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <input
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setAnswer(null);
          }}
          disabled={!hasSources}
          placeholder="e.g. How long does delivery to Kumasi take?"
          className="h-[38px] w-full rounded-md border border-line bg-field px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-500 disabled:opacity-50"
        />
        {aiStatus?.available && (
          <PrimaryButton type="submit" variant="secondary" className="w-full" loading={asking} disabled={question.trim().length < 3}>
            <SparklesIcon className="h-4 w-4" /> Answer with AI
          </PrimaryButton>
        )}
      </form>

      {answer && (
        <div
          className={cn(
            "mt-4 rounded-lg border p-3 text-sm",
            answer.covered ? "border-fuchsia-500/20 bg-fuchsia-500/5" : "border-amber-500/30 bg-amber-500/10",
          )}
        >
          {answer.covered ? (
            <>
              <p className="whitespace-pre-line text-ink">{answer.answer}</p>
              {answer.sources.length > 0 && (
                <p className="mt-2 text-xs text-ink-muted">From: {answer.sources.map((s) => s.title).join(", ")}</p>
              )}
            </>
          ) : (
            <p className="text-ink">
              Your knowledge base doesn&apos;t answer this yet. Drafts will leave a <code className="font-mono">[placeholder]</code> for
              the agent — add an article to cover it.
            </p>
          )}
        </div>
      )}

      {debounced.trim().length >= 2 && !answer && (
        <div className="mt-4">
          <div className="label-caps mb-2 flex items-center gap-2 text-ink-muted">
            Best matches {searching && <Spinner className="h-3 w-3" />}
          </div>
          {!searching && passages.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing matches. Try other words, or add an article that covers this.</p>
          ) : (
            <ul className="space-y-2">
              {passages.slice(0, 4).map((p, i) => (
                <li key={`${p.sourceId}-${i}`} className="rounded-lg bg-surface-2 p-3">
                  <p className="truncate text-xs font-medium text-ink">{p.heading ?? p.title}</p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-soft">{p.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
};

/* ─────────────────────────────── Page ─────────────────────────────── */

const KnowledgePage: FC = () => {
  const { sources, loading, refetch } = useKnowledgeSources();
  const canManage = useHasRole(["admin", "supervisor"]);
  const isAdmin = useHasRole(["admin"]);
  const { aiStatus } = useAiStatus();
  const [modal, setModal] = useUrlState("modal");
  const [id, setId] = useUrlState("id");
  const [filter, setFilter] = useState("");
  const [removing, setRemoving] = useState<KnowledgeSource | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const { deleteSource, loading: deleting } = useDeleteKnowledgeSource();

  const open = (name: string, sourceId: string | null = null) => {
    setId(sourceId);
    setModal(name);
  };
  const [, setSuggestedTitle] = useUrlState("title");
  const close = () => {
    setModal(null);
    setId(null);
    setSuggestedTitle(null);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const source = await uploadKnowledgeFile(file);
        toast.success(`Added “${source.title}”`);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
    void refetch();
  };

  const remove = async () => {
    if (!removing) return;
    try {
      await deleteSource(removing.id);
      toast.success(`Removed “${removing.title}”`);
      setRemoving(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const shown = filter.trim()
    ? sources.filter((s) => `${s.title} ${s.url ?? ""} ${s.fileName ?? ""}`.toLowerCase().includes(filter.trim().toLowerCase()))
    : sources;
  const enabled = sources.filter((s) => s.enabled);
  const viewing = modal === "view" ? id : null;

  return (
    <div>
      <Header
        title="Knowledge base"
        description="What your AI drafts know about your business. Add your FAQs, policies and help pages — drafts quote them, show their sources, and flag questions they don't cover."
        action={
          canManage ? (
            <AddMenu
              onArticle={() => open("article")}
              onUrl={() => open("url")}
              onFile={() => fileInput.current?.click()}
              uploading={uploading}
            />
          ) : undefined
        }
      />
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={KNOWLEDGE_FILE_ACCEPT}
        className="hidden"
        onChange={(e) => void upload(e.target.files)}
      />

      {aiStatus && !aiStatus.available && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-soft">
          <SparklesIcon className="h-4 w-4 text-fuchsia-700 dark:text-phosphor" />
          <span className="flex-1">AI drafts start using your knowledge base once AI assist is turned on.</span>
          {isAdmin && (
            <Link to="/settings/ai" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
              Set up AI assist
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading && !sources.length ? (
            <CardShimmer />
          ) : sources.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                title="Teach the AI about your business"
                description="Without a knowledge base, drafts can only be polite — they don't know your prices, policies or opening hours. Start with the questions your team answers most:"
                action={
                  <div className="space-y-5">
                    <ul className="mx-auto max-w-sm space-y-1 text-left text-sm text-ink-soft">
                      {STARTERS.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span className="text-primary-600 dark:text-primary-300">•</span> {s}
                        </li>
                      ))}
                    </ul>
                    {canManage ? (
                      <div className="flex flex-wrap justify-center gap-2">
                        <PrimaryButton onClick={() => open("article")}>
                          <DocumentTextIcon className="h-4 w-4" /> Write an article
                        </PrimaryButton>
                        <PrimaryButton variant="secondary" onClick={() => open("url")}>
                          <GlobeAltIcon className="h-4 w-4" /> Add your FAQ page
                        </PrimaryButton>
                        <PrimaryButton variant="secondary" onClick={() => fileInput.current?.click()} loading={uploading}>
                          <PaperClipIcon className="h-4 w-4" /> Upload a document
                        </PrimaryButton>
                      </div>
                    ) : (
                      <p className="text-sm text-ink-muted">Ask an admin or supervisor to add some.</p>
                    )}
                  </div>
                }
              />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
                <p className="text-sm text-ink-soft">
                  <span className="font-medium text-ink">{enabled.length}</span> of {sources.length} source
                  {sources.length === 1 ? "" : "s"} in use
                </p>
                {sources.length > 6 && (
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter…"
                    className="h-8 w-48 rounded-md border border-line bg-field px-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-500"
                  />
                )}
              </div>
              <ul className="divide-y divide-line">
                {shown.map((source) => (
                  <SourceRow
                    key={source.id}
                    source={source}
                    canManage={canManage}
                    onOpen={() => open(source.type === "article" && canManage ? "article" : "view", source.id)}
                    onDelete={() => setRemoving(source)}
                  />
                ))}
              </ul>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <TestPanel hasSources={enabled.length > 0} />
          <Card className="p-5 text-xs leading-relaxed text-ink-muted">
            <p className="mb-1.5 text-sm font-medium text-ink">How drafts use this</p>
            When an agent clicks <strong className="font-medium text-ink-soft">Draft reply</strong>, we find the passages that
            match the customer&apos;s question and give them to your AI. The draft shows which sources it used — or says the
            knowledge base didn&apos;t cover it and leaves a [placeholder]. Turn a source off to stop drafts using it.
          </Card>
        </div>
      </div>

      <ArticleModal open={modal === "article"} id={modal === "article" ? id : null} onClose={close} />
      <UrlModal open={modal === "url"} onClose={close} />
      <ViewSourceModal id={viewing} onClose={close} />
      <ConfirmModal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        loading={deleting}
        title="Remove this source?"
        confirmLabel="Remove"
        description={
          <p>
            “{removing?.title}” will be removed from the knowledge base and AI drafts will stop using it. To keep it but pause it,
            turn it off instead.
          </p>
        }
      />
    </div>
  );
};

export default KnowledgePage;
