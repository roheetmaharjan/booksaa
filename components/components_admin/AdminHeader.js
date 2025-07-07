import Image from "next/image";
import { SquaresFourIcon, GearIcon, UsersIcon } from "@phosphor-icons/react";
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
    <div className="flex border-b py-3 px-4 flex-row justify-between">
      <div className="w-full flex flex-row gap-5 item-center">
        <div className="flex">
          <Image src="/logo.png" width="150" height="150" alt="Bookaroo" />
        </div>
        <nav className="hidden md:flex flex-row gap-3">
          <button className="flex gap-2 items-center" onClick={handleNav("/admin")}><SquaresFourIcon size={25} weight="duotone"/>Dashboard</button>
          <button className="flex gap-2 items-center" onClick={handleNav("/admin/users")}><UsersIcon size={25} weight="duotone" /> Users</button>
          <button className="flex gap-2 items-center" onClick={handleNav("/admin/settings")}><GearIcon size={25} weight="duotone" /> Settings</button>
        </nav>
        <div className="hidden md:flex md:ml-auto">
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign Out</button>
        </div>
        <div className="flex ml-auto md:hidden">
          Menu
        </div>
      </div>
    </div>
  );
}
  