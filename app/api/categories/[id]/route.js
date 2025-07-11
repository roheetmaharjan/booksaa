import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const userId = params.id;
  try {
    const deletedUser = await prisma.user.DELETE({
      where: { id: userId },
      return NextResponse.json({message:"User deleted Successfull", user:deletedUser},{status:200})
    });
  } catch {}
}
