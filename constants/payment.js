import { Banknote, CreditCard, ScanQrCode } from "lucide-react";
export const PAYMENT_METHODS = [
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "QR", label: "QR", icon: ScanQrCode },
];

export const PAYMENT_OPTIONS = {
  CASH: "collect_now_cash",
  LINK: "send_link",
  SKIP: "skip_deposit",
  CARD: "collect_now_card",
};

export function getPaymentOptionForMethod(method) {
  if (method === "cash") return PAYMENT_OPTIONS.CASH;
  if (method === "link") return PAYMENT_OPTIONS.LINK;
  if (method === "skip") return PAYMENT_OPTIONS.SKIP;

  return PAYMENT_OPTIONS.CARD;
}