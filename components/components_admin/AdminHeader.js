import Image from "next/image";
import { SquaresFourIcon, GearIcon, UsersIcon,ChartBarIcon,QuestionIcon } from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import { usePathname,useRouter } from "next/navigation";

export default function AdminHeader({startTransition}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNav = (href) => (e) =>{
    e.preventDefault();
    startTransition(()=>{
      router.push(href);
    })
  }
  return (
    <div className="flex border-b py-3 px-4 flex-row justify-between sticky top-0 bg-white">
      <div className="w-full flex flex-row gap-5 item-center justify-between">
        <div className="flex">
          <Image src="/logo.png" width="120" height="100" alt="Bookaroo" style="width: 100%; height: auto " />
        </div>
        <nav className="hidden md:flex flex-row gap-3">
          <button className="flex gap-2 items-center" onClick={handleNav("/admin")}><SquaresFourIcon size={25} weight="duotone"/>Dashboard</button>
          <button className="flex gap-2 items-center" onClick={handleNav("/admin/users")}><UsersIcon size={25} weight="duotone" /> Users</button>
          <button className="flex gap-2 items-center" onClick={handleNav("/admin/settings")}><GearIcon size={25} weight="duotone" /> Settings</button>
          <button className="flex gap-2 items-center" onClick={handleNav("/admin/reports")}><ChartBarIcon size={25} weight="duotone" /> Reports</button>
          <button className="flex gap-2 items-center" onClick={handleNav("/admin/support")}><QuestionIcon size={25} weight="duotone" /> Support</button>
        </nav>
        <div className="hidden md:flex">
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign Out</button>
        </div>
        <div className="flex md:hidden">
          Menu
        </div>
      </div>
    </div>
  );
}
  