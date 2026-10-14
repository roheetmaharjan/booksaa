
export default function Step({ number, label, active = false, completed = false }) {
  return (
    <div
      className={`
        border-b-2 pb-1 text-xs font-semibold transition
        ${active ? "border-pink-600 text-pink-600" : completed ? "border-emerald-500 text-emerald-700" : "border-transparent text-slate-500"}
      `}
    >
      {number} {label}
    </div>
  );
}