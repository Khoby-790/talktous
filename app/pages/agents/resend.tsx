import { type FC, useEffect, useRef, useState } from "react";
import { PrimaryButton } from "~/components/buttons";
import { Modal } from "~/components/layouts";
import { useResendInvite } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { InviteLinkPanel } from "./invite";

interface Props {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

/** Issues a fresh invite link (the old one stops working) and shows it. */
const ResendInviteModal: FC<Props> = ({ open, id, onClose }) => {
  const { resendInvite, loading } = useResendInvite();
  const [result, setResult] = useState<{ name: string; email: string; inviteUrl: string; emailSent: boolean } | null>(
    null,
  );
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !id || sentFor.current === id) return;
    sentFor.current = id;
    resendInvite(id)
      .then((payload) => {
        if (payload)
          setResult({ name: payload.agent.name, email: payload.agent.email, inviteUrl: payload.inviteUrl, emailSent: payload.emailSent });
      })
      .catch((error: unknown) => {
        toast.error(getErrorMessage(error));
        onClose();
      });
  }, [open, id, resendInvite, onClose]);

  const close = () => {
    onClose();
    setTimeout(() => {
      setResult(null);
      sentFor.current = null;
    }, 200);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invitation resent"
      size="xl"
      loading={loading || !result}
      footer={<PrimaryButton onClick={close}>Done</PrimaryButton>}
    >
      {result && <InviteLinkPanel {...result} />}
    </Modal>
  );
};

export default ResendInviteModal;
