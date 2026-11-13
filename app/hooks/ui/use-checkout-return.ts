import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { checkoutReference, useConfirmCheckout } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";

/**
 * Handles Paystack Checkout's redirect back: `?checkout=success&reference=…`
 * (verified with the API, which starts the trial or applies the plan) or
 * `?checkout=cancelled`. Clears the params either way.
 */
export const useCheckoutReturn = (onPaid?: () => void) => {
  const [params, setParams] = useSearchParams();
  const { confirmCheckout, loading } = useConfirmCheckout();
  const handled = useRef(false);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    const checkout = params.get("checkout");
    if (!checkout || handled.current) return;
    handled.current = true;
    const reference = checkoutReference(params);
    const next = new URLSearchParams(params);
    ["checkout", "reference", "trxref"].forEach((key) => next.delete(key));
    setParams(next, { replace: true });

    if (checkout === "cancelled" || !reference) {
      toast.info("Payment cancelled. Nothing has changed.");
      return;
    }
    confirmCheckout(reference)
      .then(({ paid, trialStarted }) => {
        if (trialStarted) {
          toast.success("Card saved — your free trial has started. The small check charge is being refunded.");
          onPaidRef.current?.();
        } else if (paid) {
          toast.success("Payment received — your new plan is active.");
          onPaidRef.current?.();
        } else {
          toast.info("The payment didn't go through, so nothing has changed.");
        }
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  }, [params, setParams, confirmCheckout]);

  return { confirming: loading };
};
