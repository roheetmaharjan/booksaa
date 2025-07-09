import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(request) {
    try{
        const body = await request.json();
        const {name,location,description,cancellation_policy,categoryID,category} = body
        if(!name || !location || !description || !cancellation_policy||categoryID||category){
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const newVendor = await prisma.vendor.create({
            data: {
                id: Date.now(),
                name,
                location,
                description,
                cancellation_policy,
                categoryID,
                category
            },
        });
        return NextResponse.json({newVendor}, { status: 201 });
    }
    catch(error){
        console.error(error);
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}