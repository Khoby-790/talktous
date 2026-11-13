import { type FC } from "react";
import { useNavigate } from "react-router";
import { ConfirmModal } from "~/components/layouts";
import { useApp, useDeleteApp } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";

interface Props {
  open: boolean;
  id: string | null;
  onClose: () => void;
  /** Where to go afterwards (the detail page sends you back to the list). */
  redirectTo?: string;
}

const DeleteAppModal: FC<Props> = ({ open, id, onClose, redirectTo }) => {
  const navigate = useNavigate();
  const { app } = useApp(open ? id : null);
  const { deleteApp, loading } = useDeleteApp();

  const confirm = async () => {
    if (!id) return;
    try {
      await deleteApp(id);
      toast.success(`${app?.name ?? "App"} deleted`);
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
      title="Delete app"
      confirmLabel="Delete app"
      description={
        <>
          <p>
            Delete <span className="font-medium text-ink">{app?.name ?? "this app"}</span>? It stops accepting new
            conversations immediately and its keys stop working.
          </p>
          <p className="mt-2">Existing conversations and customers are kept and stay searchable.</p>
        </>
      }
    />
  );
};

export default DeleteAppModal;
