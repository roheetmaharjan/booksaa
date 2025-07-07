"use client"
import { signOut } from "next-auth/react";
export default function VendorLayout(){
    return(
        <div>
            this is a vendor layput
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign Out</button>
        </div>
    )
}