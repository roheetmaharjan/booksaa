"use client"
import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { useMutation } from "@/hooks/useMutation";
import {
  CreditCard,
  Banknote,
  Receipt,
  Trash2,
  Check,
  Clock,
  Mail,
  Printer,
  Gift,
  SplitSquareHorizontal,
  Phone,
  ChevronDown,
  Sparkles,
  RotateCcw,
} from "lucide-react";

/* ----------------------------------------------------------------------- */
/*  Helpers                                                                 */
/* ----------------------------------------------------------------------- */

const money = (n) =>
  (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2);

const cx = (...c) => c.filter(Boolean).join(" ");

/* Smooth, "ticking" number so front-desk staff can see totals update. */
function AnimatedAmount({ value, className }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const from = prev.current;
    const to = value;
    const start = performance.now();
    const duration = 320;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
      else setDisplay(to);
    };
    raf = requestAnimationFrame(step);
    setFlash(true);
    const timeout = setTimeout(() => setFlash(false), 400);
    prev.current = value;
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [value]);

  return (
    <span
      className={cx(
        "tabular-nums transition-colors duration-300",
        flash ? "text-indigo-600" : "",
        className
      )}
    >
      {money(display)}
    </span>
  );
}

/* ----------------------------------------------------------------------- */
/*  Tiny shadcn-style primitives (Tailwind only, no external UI package)   */
/* ----------------------------------------------------------------------- */

function Card({ className, children }) {
  return (
    <div
      className={cx(
        "bg-white rounded-xl border border-slate-200 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children }) {
  return (
    <div className={cx("px-0 pt-0 pb-2 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

function CardTitle({ icon: Icon, children, tone = "slate" }) {
  const tones = {
    slate: "text-slate-900",
    indigo: "text-indigo-700",
    amber: "text-amber-700",
  };
  return (
    <h3 className={cx("flex items-center gap-2 text-sm font-semibold uppercase tracking-wide", tones[tone])}>
      {Icon && <Icon className="w-4 h-4" strokeWidth={2.25} />}
      {children}
    </h3>
  );
}

function Badge({ children, className }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}) {
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    outline: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    destructive: "bg-white text-rose-500 border border-rose-200 hover:bg-rose-50",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  };
  const sizes = {
    sm: "text-xs px-2.5 py-1.5 rounded-lg",
    md: "text-sm px-3.5 py-2 rounded-lg",
    lg: "text-base px-5 py-3.5 rounded-xl",
    icon: "p-1.5 rounded-lg",
  };
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-1.5 font-medium transition disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Separator({ className }) {
  return <div className={cx("h-px bg-slate-200", className)} />;
}

function Avatar({ name, size = 48 }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

/* Scalloped "torn receipt" edge — the signature visual for payment cards */
function ReceiptEdge() {
  return (
    <div
      className="h-4 w-full"
      style={{
        backgroundImage:
          "radial-gradient(circle at 10px 0, #f8fafc 9px, transparent 9.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "top left",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

function Accordion({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition text-left"
      >
        <div>
          <p className="text-sm font-medium text-slate-800">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <ChevronDown
          className={cx("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="px-4 py-3 bg-white text-sm text-slate-600">{children}</div>}
    </div>
  );
}

function Textarea(props) {
  return (
    <textarea
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-none"
      {...props}
    />
  );
}

function Input(props) {
  return (
    <input
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
      {...props}
    />
  );
}

/* ----------------------------------------------------------------------- */
/*  Static data                                                            */
/* ----------------------------------------------------------------------- */

const TAX_RATE = 8;

/* ----------------------------------------------------------------------- */
/*  Customer Card                                                          */
/* ----------------------------------------------------------------------- */

function CustomerCard({ customer, appointment }) {
  const displayName = customer?.name || customer?.fullName || "Customer";
  const phone = customer?.phone || "";
  const email = customer?.email || "";

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <Avatar name={displayName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-slate-900">{displayName}</h2>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {phone}
              </span>
            )}
            {email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {email}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {appointment && (
            <>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {appointment}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Services Section                                                       */
/* ----------------------------------------------------------------------- */

function ServiceList({ services, onRemove }) {
  const subtotal = services.reduce((s, x) => s + x.price, 0);
  return (
    <Card className="p-5">
      <CardHeader className="px-0 pt-0">
        <CardTitle icon={Sparkles} tone="indigo">Services</CardTitle>
        <span className="text-sm font-semibold text-indigo-700">{money(subtotal)}</span>
      </CardHeader>

      {services.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 font-medium">Service</th>
                <th className="py-2 font-medium">Professional</th>
                <th className="py-2 font-medium">Duration</th>
                <th className="py-2 font-medium text-right">Price</th>
                <th className="py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="py-3 text-slate-600">{s.professional}</td>
                  <td className="py-3 text-slate-600">{s.duration} min</td>
                  <td className="py-3 text-right font-semibold text-slate-800">
                    {money(s.price)}
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="destructive" size="icon" onClick={() => onRemove(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-4">No services added yet.</p>
      )}
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Product Section                                                        */
/* ----------------------------------------------------------------------- */

// function AddProductDialog({ open, onClose, onAdd }) {
//   const [query, setQuery] = useState("");
//   const [tab, setTab] = useState("All");
//   if (!open) return null;

//   const tabs = ["All", "Hair", "Skin", "Retail"];
//   const filtered = CATALOG.filter(
//     (p) =>
//       (tab === "All" || p.category === tab) &&
//       p.name.toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
//           <h3 className="font-semibold text-slate-900">Add product</h3>
//           <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//         <div className="p-4 space-y-3">
//           <div className="relative">
//             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             <input
//               autoFocus
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search products…"
//               className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
//             />
//           </div>
//           <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
//             {tabs.map((t) => (
//               <button
//                 key={t}
//                 onClick={() => setTab(t)}
//                 className={cx(
//                   "flex-1 text-xs font-medium py-1.5 rounded-md transition",
//                   tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
//                 )}
//               >
//                 {t}
//               </button>
//             ))}
//           </div>
//           <div className="max-h-64 overflow-y-auto -mx-1 px-1 space-y-1">
//             {filtered.map((p) => (
//               <button
//                 key={p.id}
//                 onClick={() => {
//                   onAdd(p);
//                   onClose();
//                 }}
//                 className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-indigo-50 text-left transition"
//               >
//                 <span className="text-sm text-slate-700">{p.name}</span>
//                 <span className="text-sm font-medium text-slate-500">{money(p.price)}</span>
//               </button>
//             ))}
//             {filtered.length === 0 && (
//               <p className="text-sm text-slate-400 text-center py-6">No products found.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ProductList({ products, setProducts }) {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const subtotal = products.reduce((s, p) => s + p.price * p.qty, 0);

//   const addProduct = (item) => {
//     setProducts((prev) => {
//       const existing = prev.find((p) => p.id === item.id);
//       if (existing) {
//         return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
//       }
//       return [...prev, { ...item, qty: 1 }];
//     });
//   };
//   const changeQty = (id, delta) =>
//     setProducts((prev) =>
//       prev
//         .map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p))
//     );
//   const removeProduct = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

//   return (
//     <Card className="p-5">
//       <CardHeader className="px-0 pt-0">
//         <CardTitle className="!p-0" icon={ShoppingBag} tone="indigo">Products used</CardTitle>
//         <span className="text-sm font-semibold text-indigo-700">{money(subtotal)}</span>
//       </CardHeader>

//       {products.length > 0 ? (
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-slate-200 text-left text-slate-500">
//                 <th className="py-2 font-medium">Product</th>
//                 <th className="py-2 font-medium">Unit price</th>
//                 <th className="py-2 font-medium text-center">Qty</th>
//                 <th className="py-2 font-medium text-right">Total</th>
//                 <th className="py-2 w-10"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {products.map((p) => (
//                 <tr key={p.id} className="border-b border-slate-100 last:border-0">
//                   <td className="py-3 font-medium text-slate-800">{p.name}</td>
//                   <td className="py-3 text-slate-500">{money(p.price)}</td>
//                   <td className="py-3">
//                     <div className="flex items-center justify-center border border-slate-200 rounded-lg w-fit mx-auto">
//                       <button
//                         onClick={() => changeQty(p.id, -1)}
//                         className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-l-lg"
//                       >
//                         <Minus className="w-3.5 h-3.5" />
//                       </button>
//                       <span className="w-7 text-center text-sm font-medium">{p.qty}</span>
//                       <button
//                         onClick={() => changeQty(p.id, 1)}
//                         className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-r-lg"
//                       >
//                         <Plus className="w-3.5 h-3.5" />
//                       </button>
//                     </div>
//                   </td>
//                   <td className="py-3 text-right font-semibold text-slate-800">
//                     {money(p.price * p.qty)}
//                   </td>
//                   <td className="py-3 text-right">
//                     <button
//                       onClick={() => removeProduct(p.id)}
//                       className="text-slate-300 hover:text-rose-500 transition"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-sm text-slate-400 text-center py-3">No products added.</p>
//       )}

//       <Button variant="outline" className="mt-3 w-full" onClick={() => setDialogOpen(true)}>
//         <Search className="w-4 h-4" /> Search &amp; add product
//       </Button>

//       <AddProductDialog
//         open={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         onAdd={addProduct}
//       />
//     </Card>
//   );
// }

/* ----------------------------------------------------------------------- */
/*  Tip Selector                                                            */
/* ----------------------------------------------------------------------- */

function TipSelector({ tip, setTip, servicesSubtotal, staffOptions }) {
  const options = [
    { key: "none", label: "No tip" },
    { key: "10", label: "10%" },
    { key: "15", label: "15%" },
    { key: "20", label: "20%" },
    { key: "custom", label: "Custom" },
  ];

  const tipAmount =
    tip.option === "none"
      ? 0
      : tip.option === "custom"
      ? tip.custom || 0
      : (servicesSubtotal * Number(tip.option)) / 100;

  return (
    <Card className="p-5">
      <CardHeader className="px-0 pt-0">
        <CardTitle icon={Gift} tone="amber">Tip</CardTitle>
        <span className="text-sm font-semibold text-amber-600">{money(tipAmount)}</span>
      </CardHeader>

      <div className="grid grid-cols-5 gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => setTip((t) => ({ ...t, option: o.key }))}
            className={cx(
              "py-2 rounded-lg text-sm font-medium border transition",
              tip.option === o.key
                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                : "border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {tip.option === "custom" && (
        <div className="mt-3">
          <label className="text-xs text-slate-500 mb-1 block">Custom tip amount</label>
          <Input
            type="number"
            min="0"
            value={tip.custom}
            onChange={(e) => setTip((t) => ({ ...t, custom: Number(e.target.value) }))}
            placeholder="0.00"
          />
        </div>
      )}

      {tipAmount > 0 && (
        <div className="mt-3">
          <label className="text-xs text-slate-500 mb-1 block">Professional receiving tip</label>
          <select
            value={tip.professional}
            onChange={(e) => setTip((t) => ({ ...t, professional: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            {staffOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Notes                                                                   */
/* ----------------------------------------------------------------------- */

function NotesSection({ notes, setNotes }) {
  return (
    <Card className="p-5">
      <CardTitle tone="slate">Checkout notes</CardTitle>
      <Textarea
        className="mt-3"
        rows={3}
        placeholder="e.g. Customer requested extra styling"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Payment Summary (receipt style)                                         */
/* ----------------------------------------------------------------------- */

function PaymentSummary({ servicesSubtotal, discount, setDiscount, taxAmount, tipAmount, grandTotal }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <CardTitle icon={Receipt}>Payment summary</CardTitle>
        <div className="mt-4 space-y-2.5 text-sm font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Services</span>
            <AnimatedAmount value={servicesSubtotal} />
          </div>
          {/* <div className="flex justify-between text-slate-600">
            <span>Products</span>
            <AnimatedAmount value={productsSubtotal} />
          </div> */}
          <div className="flex justify-between items-center text-slate-600">
            <span>Discount</span>
            <span className="flex items-center gap-1 text-rose-500">
              -$
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-14 text-right bg-transparent border-b border-dashed border-rose-300 focus:outline-none focus:border-rose-500 tabular-nums"
              />
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax ({TAX_RATE}%)</span>
            <AnimatedAmount value={taxAmount} />
          </div>
          <div className="flex justify-between text-amber-600">
            <span>Tip</span>
            <AnimatedAmount value={tipAmount} className="text-amber-600" />
          </div>
        </div>
        <Separator className="my-4 border-dashed" />
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-slate-900">Total</span>
          <AnimatedAmount value={grandTotal} className="text-xl font-bold text-slate-900" />
        </div>
      </div>
      <ReceiptEdge />
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Payment History                                                         */
/* ----------------------------------------------------------------------- */

function PaymentHistory({ history }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <CardTitle icon={Clock}>Payment history</CardTitle>
        <div className="mt-3 max-h-40 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      {h.method === "Cash" ? (
                        <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                      )}
                      {h.method}
                    </div>
                    <p className="text-xs text-slate-400">{h.day} · {h.time}</p>
                  </td>
                  <td className="py-2 text-right font-semibold text-slate-800 font-mono tabular-nums">
                    {money(h.amount)}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center text-slate-400 py-4">
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ReceiptEdge />
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Remaining Balance                                                       */
/* ----------------------------------------------------------------------- */

function RemainingBalance({ amount }) {
  const settled = amount <= 0;
  return (
    <Card
      className={cx(
        "p-5 border-none text-white",
        settled
          ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
          : "bg-gradient-to-br from-orange-500 to-rose-500"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">
        {settled ? "Balance settled" : "Remaining balance"}
      </p>
      <AnimatedAmount value={Math.max(amount, 0)} className="text-3xl font-bold block mt-1 text-white" />
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Payment Methods                                                         */
/* ----------------------------------------------------------------------- */

function CashPayment({ remaining, cash, setCash }) {
  const change = Math.max(0, cash - remaining);
  const quick = [
    { label: "Exact", value: remaining },
    { label: "$50", value: 50 },
    { label: "$100", value: 100 },
    { label: "$200", value: 200 },
  ];
  return (
    <div className="mt-4 space-y-3">
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Amount received</label>
        <Input
          type="number"
          min="0"
          value={cash}
          onChange={(e) => setCash(Number(e.target.value))}
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {quick.map((q) => (
          <button
            key={q.label}
            onClick={() => setCash(Number(q.value.toFixed(2)))}
            className="py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm font-medium px-1">
        <span className="text-slate-500">Change returned</span>
        <span className="text-emerald-600 font-mono">{money(change)}</span>
      </div>
    </div>
  );
}

function CardPayment({ remaining, onProcess }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center px-1">
        <span className="text-sm text-slate-500">Card payment amount</span>
        <span className="text-lg font-semibold text-slate-900 font-mono">{money(remaining)}</span>
      </div>
      <Button variant="default" className="w-full" size="lg" onClick={onProcess}>
        <CreditCard className="w-4 h-4" /> Process card payment
      </Button>
    </div>
  );
}

function SplitPayment({ remaining, split, setSplit }) {
  const setCash = (val) => {
    const cashVal = Math.max(0, Math.min(val, remaining));
    setSplit({ cash: cashVal, card: Number((remaining - cashVal).toFixed(2)) });
  };
  const setCard = (val) => {
    const cardVal = Math.max(0, Math.min(val, remaining));
    setSplit({ card: cardVal, cash: Number((remaining - cardVal).toFixed(2)) });
  };
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
          <Banknote className="w-3.5 h-3.5" /> Cash
        </label>
        <Input type="number" min="0" value={split.cash} onChange={(e) => setCash(Number(e.target.value))} />
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5" /> Card
        </label>
        <Input type="number" min="0" value={split.card} onChange={(e) => setCard(Number(e.target.value))} />
      </div>
    </div>
  );
}

function PaymentMethods({ method, setMethod, remaining, cash, setCash, split, setSplit, onProcessCard }) {
  const methods = [
    { key: "cash", label: "Cash", icon: Banknote },
    { key: "card", label: "Card", icon: CreditCard },
    { key: "giftcard", label: "Gift card", icon: Gift },
    { key: "split", label: "Split", icon: SplitSquareHorizontal },
  ];
  return (
    <Card className="p-5">
      <CardTitle>Payment method</CardTitle>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {methods.map((m) => (
          <button
            key={m.key}
            onClick={() => setMethod(m.key)}
            className={cx(
              "flex flex-col items-center justify-center gap-1.5 rounded-xl border py-4 transition",
              method === m.key
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-slate-50"
            )}
          >
            <m.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      {method === "cash" && <CashPayment remaining={remaining} cash={cash} setCash={setCash} />}
      {method === "card" && <CardPayment remaining={remaining} onProcess={onProcessCard} />}
      {method === "giftcard" && (
        <div className="mt-4 text-sm text-slate-500 bg-slate-50 rounded-lg p-3 text-center">
          Gift card balance will be applied automatically at checkout.
        </div>
      )}
      {method === "split" && <SplitPayment remaining={remaining} split={split} setSplit={setSplit} />}
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Checkout Footer                                                        */
/* ----------------------------------------------------------------------- */

function CheckoutFooter({ remaining, onComplete, disabled }) {
  return (
    <div className="sticky bottom-0 mt-2">
      <Button
        variant="success"
        size="lg"
        className="w-full justify-between"
        disabled={disabled}
        onClick={onComplete}
      >
        <span className="flex items-center gap-2">
          <Check className="w-5 h-5" /> Complete checkout
        </span>
        <span className="font-mono">{money(Math.max(remaining, 0))}</span>
      </Button>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/*  Success screen                                                          */
/* ----------------------------------------------------------------------- */

function SuccessState({ total, customerName, onReset }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <Check className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Payment completed</h2>
      <p className="text-sm text-slate-500 mt-1">
        {money(total)} collected from {customerName}
      </p>
      <div className="grid grid-cols-1 gap-2 mt-6">
        <Button variant="outline" className="w-full">
          <Printer className="w-4 h-4" /> Print receipt
        </Button>
        <Button variant="outline" className="w-full">
          <Mail className="w-4 h-4" /> Email receipt
        </Button>
        <Button variant="default" className="w-full" onClick={onReset}>
          <RotateCcw className="w-4 h-4" /> Start new checkout
        </Button>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------------- */
/*  Checkout Layout / Page                                                  */
/* ----------------------------------------------------------------------- */

function CheckoutLayout({ left, right }) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
      <div className="space-y-5 min-w-0">{left}</div>
      <div className="space-y-5 lg:sticky lg:top-6 min-w-0">{right}</div>
    </div>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [customer, setCustomer] = useState(null);
  const [services, setServices] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState({ option: "none", custom: 0, professional: "" });
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState([]);
  const [method, setMethod] = useState("cash");
  const [cash, setCash] = useState(0);
  const [split, setSplit] = useState({ cash: 0, card: 0 });
  const [complete, setComplete] = useState(false);

  const { data, loading, error } = useFetch(bookingId ? `/api/bookings/${bookingId}/checkout` : null);
  const booking = data?.booking;
  const { mutate, loading: submitting, error: mutationError } = useMutation(
    bookingId ? `/api/bookings/${bookingId}/checkout` : "",
    { method: "PUT" }
  );

  useEffect(() => {
    if (!booking) return;

    const bookingCustomer = {
      name: booking.customer?.fullName || booking.customerName || "Customer",
      fullName: booking.customer?.fullName || booking.customerName || "Customer",
      phone: booking.customer?.phone || booking.customerPhone || "",
      email: booking.customer?.email || booking.customerEmail || "",
    };

    const bookingService = {
      id: booking.service?.id || booking.id,
      name: booking.service?.name || "Service",
      professional: booking.professional?.name || "Staff",
      duration: booking.service?.duration || 30,
      price: Number(booking.paymentAmount || booking.service?.price || 0),
    };

    const appointmentLabel = booking.scheduledAt
      ? new Date(booking.scheduledAt).toLocaleString("en", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Appointment";

    setCustomer(bookingCustomer);
    setServices([bookingService]);
    setStaffOptions([bookingService.professional].filter(Boolean));
    setDiscount(0);
    setTip({ option: "none", custom: 0, professional: bookingService.professional });
    setNotes(booking.notes || "");
    setHistory([]);
    setMethod("cash");
    setCash(0);
    setSplit({ cash: 0, card: 0 });
    setComplete(Boolean(booking.paymentStatus === "PAID" || Number(booking.remainingBalance || 0) <= 0));
  }, [booking]);

  const servicesSubtotal = useMemo(() => services.reduce((s, x) => s + x.price, 0), [services]);

  const tipAmount =
    tip.option === "none" ? 0 : tip.option === "custom" ? tip.custom || 0 : (servicesSubtotal * Number(tip.option)) / 100;

  const taxableAmount = Math.max(0, servicesSubtotal - discount);
  const taxAmount = taxableAmount * (TAX_RATE / 100);
  const grandTotal = taxableAmount + taxAmount + tipAmount;

  const totalPaid = history.reduce((s, h) => s + h.amount, 0) + Number(booking?.paidAmount || 0);
  const remaining = Number((grandTotal - totalPaid).toFixed(2));

  useEffect(() => {
    setSplit({ cash: 0, card: Math.max(remaining, 0) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  const removeService = (id) => setServices((prev) => prev.filter((s) => s.id !== id));

  const canComplete =
    remaining <= 0
      ? false
      : method === "cash"
      ? cash >= remaining
      : method === "split"
      ? Math.abs(split.cash + split.card - remaining) < 0.01
      : true;

  const completeCheckout = async () => {
    if (!bookingId || !booking) return;

    const recordedAmount = method === "cash" ? Math.min(cash, remaining) : method === "split" ? split.cash + split.card : remaining;
    const paymentLabel = method === "cash" ? "Cash" : method === "card" ? "Card" : method === "split" ? "Split" : "Gift card";

    if (recordedAmount <= 0) return;

    try {
      const result = await mutate({ amountPaid: recordedAmount, paymentMethod: method === "cash" ? "CASH" : method === "card" ? "CARD" : method === "split" ? "SPLIT" : "GIFT_CARD" });
      if (result?.booking) {
        setHistory((prev) => [
          ...prev,
          { id: `h${prev.length + 1}`, method: paymentLabel, amount: recordedAmount, day: "Today", time: "Now" },
        ]);
        setComplete(true);
      }
    } catch (error) {
      console.error("Checkout submission failed", error);
    }
  };

  const resetAll = () => {
    setServices([]);
    setDiscount(0);
    setTip({ option: "none", custom: 0, professional: "" });
    setNotes("");
    setHistory([]);
    setMethod("cash");
    setCash(0);
    setSplit({ cash: 0, card: 0 });
    setComplete(false);
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-lg font-semibold text-slate-900">Booking checkout requires a booking ID</h1>
          <p className="text-sm text-slate-500 mt-2">Open this page with a bookingId query parameter to load the booking from the database.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-lg font-semibold text-slate-900">Loading checkout</h1>
          <p className="text-sm text-slate-500 mt-2">Fetching the latest booking details from the database.</p>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-lg font-semibold text-slate-900">Unable to load checkout</h1>
          <p className="text-sm text-slate-500 mt-2">{error || "The selected booking could not be found."}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
          <p className="text-sm text-slate-500">Booksaa · Front desk</p>
        </div>
        <Badge className="bg-white border border-slate-200 text-slate-500">
          <Receipt className="w-3.5 h-3.5" /> Register #2
        </Badge>
      </div>

      <CheckoutLayout
        left={
          <>
            <CustomerCard customer={customer} appointment={booking?.scheduledAt ? new Date(booking.scheduledAt).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""} />
            <ServiceList services={services} onRemove={removeService} />
            <TipSelector tip={tip} setTip={setTip} servicesSubtotal={servicesSubtotal} staffOptions={staffOptions} />
            <NotesSection notes={notes} setNotes={setNotes} />
          </>
        }
        right={
          complete ? (
            <SuccessState total={grandTotal} customerName={customer?.name || customer?.fullName || "Customer"} onReset={resetAll} />
          ) : (
            <>
              <PaymentSummary
                servicesSubtotal={servicesSubtotal}
                discount={discount}
                setDiscount={setDiscount}
                taxAmount={taxAmount}
                tipAmount={tipAmount}
                grandTotal={grandTotal}
              />
              <PaymentHistory history={history} />
              <RemainingBalance amount={remaining} />
              {mutationError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {mutationError}
                </div>
              )}
              <PaymentMethods
                method={method}
                setMethod={setMethod}
                remaining={Math.max(remaining, 0)}
                cash={cash}
                setCash={setCash}
                split={split}
                setSplit={setSplit}
                onProcessCard={completeCheckout}
              />
              <CheckoutFooter remaining={remaining} onComplete={completeCheckout} disabled={!canComplete || submitting} />
            </>
          )
        }
      />
    </div>
  );
}