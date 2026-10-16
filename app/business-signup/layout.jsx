"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BusinessSignUpLayout({ children }) {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-[#062B3D] text-slate-950 relative">
      <header className="mb-6 py-4 px-4 relative z-10">
        <div className="grid grid-cols-3 gap-4 items-center justify-start">
          <Button variant="ghost" size="sm" className="w-10 h-10 bg-white/10 inline-flex rounded-lg justify-center items-center gap-2 p-0 text-sm text-white" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link href="/" className="inline-flex justify-center">
            <Image src="/logo_white.png" alt="Booksaa" width={120} height={27} priority />
          </Link>
        </div>
      </header>
      {children}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute top-0 left-20 w-80 h-80 border-[60px] border-white rounded-full" />
        <div className="absolute top-24 right-32 w-52 h-52 bg-white" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] border-[60px] border-white rounded-full" />
      </div>
    </main>
  );
}
