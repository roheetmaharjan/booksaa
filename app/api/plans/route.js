import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try{
        const results = await prisma.plans.findMany();
        return new NextResponse(JSON.stringify(results),{
            status: 200,
            headers: {
                "Content-Type":"application/json",
                "Cache-Control":"no-store"
            }
        })
    }catch(error){
        console.error("Cannot get data from plans",error);
        return new NextResponse(JSON.stringify({
            error: "Error Fetching data",
            status: 500
        }))
    }
}