import { type FC, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/components/buttons";
import { Card, CodeBlock } from "~/components/core";
import { ConfirmModal } from "~/components/layouts";
import { useRegenerateAppSecret } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import type { SupportApp } from "~/utils/types";

const KeysTab: FC<{ app: SupportApp }> = ({ app }) => {
  const { regenerateAppSecret, loading } = useRegenerateAppSecret();
  const [confirming, setConfirming] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const rotate = async () => {
    try {
      const result = await regenerateAppSecret(app.id);
      setConfirming(false);
      if (result) {
        setNewSecret(result.secretKey);
        toast.success("Secret key rotated");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-3 p-5">
        <div>
          <p className="font-medium text-ink">Public key</p>
          <p className="mt-1 text-sm text-ink-soft">
            Identifies this app in the widget snippet. Safe to expose in your website&apos;s HTML.
          </p>
        </div>
        <CodeBlock value={app.publicKey} />
      </Card>

      <Card className="space-y-3 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-medium text-ink">Secret key</p>
            <p className="mt-1 text-sm text-ink-soft">
              Authenticates server-to-server API calls. Keep it on your servers — never in browser or mobile code.
            </p>
          </div>
          <PrimaryButton variant="secondary" onClick={() => setConfirming(true)}>
            <ArrowPathIcon className="h-4 w-4" /> Rotate
          </PrimaryButton>
        </div>
        {newSecret ? (
          <>
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-200">
              Copy your new secret key now — it won&apos;t be shown again.
            </div>
            <CodeBlock value={newSecret} secret />
          </>
        ) : (
          <code className="block rounded-md border border-line bg-field p-2.5 font-mono text-xs text-ink-soft">
            {app.secretKeyHint}
          </code>
        )}
      </Card>

      <ConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={rotate}
        loading={loading}
        title="Rotate secret key"
        confirmLabel="Rotate key"
        description="The current secret key stops working immediately. Any server still using it will get 401 errors until you update it with the new key."
      />
    </div>
  );
};

export default KeysTab;
