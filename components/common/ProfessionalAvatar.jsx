import { cn } from "@/lib/utils";
function getAvatarStyle(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_COLORS = [
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];
export default function ProfessionalAvatar({ name, index, size = "md" }) {
  const { bg, text } = getAvatarStyle(index);
  const sizeClass = size === "sm" ? "h-7 w-7 text-xs" : "h-10 w-10 text-sm";
  return <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium", sizeClass, bg, text)}>{getInitials(name)}</span>;
}
