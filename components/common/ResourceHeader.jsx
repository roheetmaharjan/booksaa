import ProfessionalAvatar from "@/components/common/ProfessionalAvatar";

export default function ResourceHeader({ resource, professionals }) {
  const idx = professionals.findIndex((p) => p.id === resource.id);
  return (
    <div className="flex flex-row items-center gap-1.5 py-2 px-1">
      <ProfessionalAvatar name={resource.title} index={idx >= 0 ? idx : 0} size="md" />
      <div className="flex flex-col text-left justify-start gap-1">
        <span className="text-xs font-semibold text-slate-700 text-left leading-tight">{resource.title}</span>
        {resource.roleName && <span className="text-[10px] text-slate-400 text-left leading-tight">{resource.roleName}</span>}
      </div>
    </div>
  );
}