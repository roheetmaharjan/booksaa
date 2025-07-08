import { NextResponse } from "next/server";

export async function POST(request) {
    try{
        const body = await request.json();
        const {name,location,description,category} = body
        if(!name || !location || !description || !category){
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const newVendor = await prisma.vendor.create({
            data: {
                name,
                location,
                description,
                category,
            },
        });
        return NextResponse.json({newVendor}, { status: 201 });
    }
    catch(error){
        console.error(error);
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}