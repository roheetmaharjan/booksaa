"use client"
import { signOut } from "@/lib/auth-client";
export default function VendorLayout({children}){
    return(
        <div>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign Out</button>
            {children}
        </div>
    )
}
