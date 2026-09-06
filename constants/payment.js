import { Banknote, CreditCard, ScanQrCode } from "lucide-react";
export const PAYMENT_METHODS = [
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "QR", label: "QR", icon: ScanQrCode },
];