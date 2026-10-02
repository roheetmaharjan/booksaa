
export default function Step({ number, label, active = false }) {
  return (
    <div
      className={`
        border-b-2 pb-1 text-xs font-semibold transition
        ${active ? "border-pink-600 text-pink-600" : "border-transparent text-slate-500 hover:text-indigo-600"}
      `}
    >
      {number} {label}
    </div>
  );
}