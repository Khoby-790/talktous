import { type FC } from "react";
import { useNavigate } from "react-router";
import { ConfirmModal } from "~/components/layouts";
import { useAgent, useRemoveAgent } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";

interface Props {
  open: boolean;
  id: string | null;
  onClose: () => void;
  redirectTo?: string;
}

const RemoveAgentModal: FC<Props> = ({ open, id, onClose, redirectTo }) => {
  const navigate = useNavigate();
  const { agent } = useAgent(open ? id : null);
  const { removeAgent, loading } = useRemoveAgent();

  const confirm = async () => {
    if (!id) return;
    try {
      await removeAgent(id);
      toast.success(`${agent?.name ?? "Agent"} removed`);
      onClose();
      if (redirectTo) navigate(redirectTo);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={confirm}
      loading={loading}
      title={agent?.pending ? "Cancel invitation" : "Remove agent"}
      confirmLabel={agent?.pending ? "Cancel invitation" : "Remove agent"}
      description={
        agent?.pending ? (
          <p>
            Cancel the invitation for <span className="font-medium text-ink">{agent.email}</span>? The invite link stops
            working.
          </p>
        ) : (
          <>
            <p>
              Remove <span className="font-medium text-ink">{agent?.name ?? "this agent"}</span> from your team? They
              lose access immediately.
            </p>
            <p className="mt-2">
              Their open conversations become unassigned and return to the queue. Message history is kept.
            </p>
          </>
        )
      }
    />
  );
};

export default RemoveAgentModal;
