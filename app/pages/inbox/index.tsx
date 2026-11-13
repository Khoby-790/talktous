import { type FC, useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Drawer } from "~/components/layouts";
import { useConversation } from "~/hooks/data";
import { cn } from "~/lib/utils";
import { useSearchParams } from "react-router";
import ConversationList from "./conversation-list";
import ConversationThread from "./conversation-thread";
import CustomerSidebar from "./customer-sidebar";

export function meta() {
  return [{ title: "Inbox — Asotie" }];
}

/** Customer panel for the open conversation; shares the thread's cached query. */
const SidebarContainer: FC<{ conversationId: string; onClose?: () => void }> = ({ conversationId, onClose }) => {
  const { conversation } = useConversation(conversationId);
  if (!conversation) return null;
  return <CustomerSidebar conversation={conversation} onClose={onClose} linkToInbox />;
};

const InboxPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("conversation");
  // Switching conversations also closes any modal opened for the previous one.
  const setActiveId = (id: string | null) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set("conversation", id);
      else next.delete("conversation");
      next.delete("modal");
      return next;
    });
  // Wide screens show the customer panel by default; narrower ones open it in a drawer.
  const [panelOpen, setPanelOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches) {
      setPanelOpen((open) => !open);
    } else {
      setDrawerOpen(true);
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Left: conversation list (full width on phones until one is opened) */}
      <ConversationList
        activeId={activeId}
        onSelect={(id) => setActiveId(id)}
        className={cn("w-full shrink-0 border-r border-line md:w-80 lg:w-96", activeId && "hidden md:flex")}
      />

      {/* Middle: thread */}
      <div className={cn("min-w-0 flex-1", !activeId && "hidden md:block")}>
        {activeId ? (
          <ConversationThread
            key={activeId}
            conversationId={activeId}
            onBack={() => setActiveId(null)}
            onToggleSidebar={toggleSidebar}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-ink-muted" />
            </div>
            <h3 className="text-sm font-medium text-ink">Select a conversation</h3>
            <p className="mt-1 max-w-xs text-sm text-ink-soft">
              Pick a conversation from the list to read it and reply.
            </p>
          </div>
        )}
      </div>

      {/* Right: customer panel on wide screens */}
      {activeId && panelOpen && (
        <div className="hidden w-80 shrink-0 border-l border-line xl:block">
          <SidebarContainer conversationId={activeId} onClose={() => setPanelOpen(false)} />
        </div>
      )}

      {/* …and in a drawer below xl */}
      {activeId && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Customer">
          <div className="-mx-6 -my-4">
            <SidebarContainer conversationId={activeId} />
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default InboxPage;
