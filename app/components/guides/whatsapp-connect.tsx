import { type FC, useState } from "react";
import { PrimaryButton } from "~/components/buttons";
import { useConnectWhatsapp } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import type { Environment } from "~/utils/types";

/**
 * Meta's WhatsApp Embedded Signup. The customer never visits
 * developers.facebook.com: Meta's popup signs them in (or creates their
 * Facebook login), creates the business portfolio and WhatsApp Business
 * account, and verifies their phone number by SMS or call. We get back a
 * one-time code and the new IDs, and the API finishes the setup.
 *
 * https://developers.facebook.com/docs/whatsapp/embedded-signup
 */

type SignupConfig = NonNullable<Environment["whatsappSignup"]>;

interface FacebookSdk {
  init(options: { appId: string; version: string; autoLogAppEvents?: boolean; xfbml?: boolean }): void;
  login(
    callback: (response: { authResponse?: { code?: string } | null; status?: string }) => void,
    options: Record<string, unknown>,
  ): void;
}

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let sdk: Promise<FacebookSdk> | null = null;

const loadSdk = (config: SignupConfig): Promise<FacebookSdk> =>
  (sdk ??= new Promise<FacebookSdk>((resolve, reject) => {
    const ready = () => {
      window.FB!.init({ appId: config.appId, version: config.graphVersion, autoLogAppEvents: true, xfbml: false });
      resolve(window.FB!);
    };
    if (window.FB) return ready();
    window.fbAsyncInit = ready;
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => {
      sdk = null;
      reject(new Error("Couldn't load Meta's sign-in. A browser extension may be blocking connect.facebook.net."));
    };
    document.body.appendChild(script);
  }));

type SessionInfo =
  | { event: "FINISH" | "FINISH_ONLY_WABA"; data: { phone_number_id?: string; waba_id?: string } }
  | { event: "CANCEL"; data: { current_step?: string; error_message?: string } }
  | { event: "ERROR"; data: { error_message?: string } };

/** Meta posts the new account's IDs to the page from the popup. */
const waitForSessionInfo = () => {
  let stop = () => {};
  const promise = new Promise<SessionInfo>((resolve) => {
    const onMessage = (event: MessageEvent) => {
      if (!/(^|\.)facebook\.com$/.test(new URL(event.origin).hostname)) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP") resolve(data as SessionInfo);
      } catch {
        /* other Facebook messages */
      }
    };
    window.addEventListener("message", onMessage);
    stop = () => window.removeEventListener("message", onMessage);
  });
  return { promise, stop };
};

export const WhatsappConnectButton: FC<{
  appId: string;
  config: SignupConfig;
  label?: string;
  onConnected?: () => void;
}> = ({ appId, config, label = "Connect with WhatsApp", onConnected }) => {
  const { connectWhatsapp } = useConnectWhatsapp();
  const [busy, setBusy] = useState<null | "popup" | "saving">(null);
  const [problem, setProblem] = useState<string | null>(null);

  const run = async () => {
    setProblem(null);
    setBusy("popup");
    const session = waitForSessionInfo();
    try {
      const fb = await loadSdk(config);
      const code = await new Promise<string | null>((resolve) =>
        fb.login((response) => resolve(response.authResponse?.code ?? null), {
          config_id: config.configId,
          response_type: "code",
          override_default_response_type: true,
          extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
        }),
      );
      // The IDs arrive by postMessage around the time the popup closes.
      const info = await Promise.race([
        session.promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), code ? 5000 : 500)),
      ]);
      if (!code) {
        if (info?.event === "ERROR") throw new Error(info.data.error_message ?? "Meta reported an error.");
        setProblem("The Meta window was closed before you finished. You can pick up where you left off.");
        return;
      }
      if (info?.event === "ERROR") throw new Error(info.data.error_message ?? "Meta reported an error.");
      const phoneNumberId = info && "phone_number_id" in info.data ? info.data.phone_number_id : undefined;
      const businessAccountId = info && "waba_id" in info.data ? info.data.waba_id : undefined;
      if (!phoneNumberId || !businessAccountId) {
        throw new Error(
          "Meta didn't send back a phone number. Run the connection again and finish the phone number step.",
        );
      }
      setBusy("saving");
      await connectWhatsapp(appId, { code, phoneNumberId, businessAccountId });
      toast.success("WhatsApp is connected");
      onConnected?.();
    } catch (error) {
      setProblem(getErrorMessage(error));
    } finally {
      session.stop();
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2">
      <PrimaryButton onClick={() => void run()} loading={busy !== null} className="bg-[#1877F2] hover:bg-[#166FE5]">
        {busy === "saving" ? "Finishing setup…" : busy === "popup" ? "Waiting for Meta…" : label}
      </PrimaryButton>
      {problem && <p className="text-sm text-red-600 dark:text-red-400">{problem}</p>}
    </div>
  );
};
